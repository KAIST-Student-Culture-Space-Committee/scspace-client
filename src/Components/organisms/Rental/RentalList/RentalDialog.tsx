"use client"

import {
    Badge,
    Button,
    Center,
    DataList,
    Dialog,
    HStack,
    IconButton,
    Input,
    Separator,
    Stack,
    Text,
    Textarea,
    useBreakpointValue,
} from "@chakra-ui/react";
import { Temporal } from "@js-temporal/polyfill";
import LoadingComponent from "@scspace-client/Components/atoms/Loading";
import SimpleDialog from "@scspace-client/Components/atoms/SimpleDialog";
import DataListItem from "@scspace-client/Components/atoms/DataListItem";
import StudentSearch from "@scspace-client/Components/organisms/Rental/AdminTools/StudentSearch";
import ReturnChecklist from "@scspace-client/Components/organisms/Rental/AdminTools/ReturnChecklist";
import { useMutationApi, useQueryApi } from "@scspace-client/Hooks/api";
import { useAuth } from "@scspace-client/Hooks/auth";
import { dateUtils } from "@scspace-client/Hooks/utils";
import { RentalStatusEnum } from "@scspace-depot/enums/rental.enum";
import { RENTAL_CERTIFICATE_PENDING } from "@scspace-depot/consts/rental.const";
import { ISuccessResponse } from "@scspace-depot/types/common";
import { IGoods, IRentalAll, IRentalUpdateAdmin } from "@scspace-depot/types/rental";
import { IUser } from "@scspace-depot/types/user";
import Link from "next/link";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { HiOutlineRefresh } from "react-icons/hi";

const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";

type RentalEditState = {
    user: IUser;
    goodsId: number;
    count: number;
    timeDue: string;
    groupName: string;
    contact: string;
    emergencyContact: string;
    usingLocation: string;
    usingPurpose: string;
};

function toLocalInput(time: number): string {
    const { year, month, date, hour, minute } = dateUtils().getDateUnit(time);
    return `${year}-${String(month + 1).padStart(2, "0")}-${String(date).padStart(2, "0")}T${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
}

function getOperationalStatus(rental: IRentalAll, now: number): string {
    if (rental.status === RentalStatusEnum.CANCELLED) return "취소";
    if (rental.status === RentalStatusEnum.COMPLETED) return "정상 반납";
    if (rental.status === RentalStatusEnum.RETURNED) return "반납 확인 대기";
    if (rental.timeDue < now && rental.overdueContactedAt > 0) return "연체 후 연락";
    if (rental.timeDue < now) return "연체";
    return "대여";
}

export default function RentalDialog({ open, setOpen, rental, refetchList }: {
    open: boolean;
    setOpen: Dispatch<SetStateAction<boolean>>;
    rental: IRentalAll | null;
    refetchList: () => unknown;
}) {
    const { isManager } = useAuth();
    const { getNow, getString, getTime } = dateUtils();
    const isWide = useBreakpointValue({ base: false, md: true });
    const [mode, setMode] = useState<"view" | "edit" | "return">("view");
    const [edit, setEdit] = useState<RentalEditState | null>(null);
    const goods = useQueryApi<IGoods[]>(isManager ? "/rental/goods/list" : "");
    const rentalEndpoint = `/rental/${rental?.id ?? ""}`;
    const updateRental = useMutationApi<ISuccessResponse, IRentalUpdateAdmin>(rentalEndpoint, "PUT");
    const confirmReturn = useMutationApi<ISuccessResponse, Record<string, never>>(`${rentalEndpoint}/confirm`, "PUT");
    const contactOverdue = useMutationApi<ISuccessResponse, Record<string, never>>(`${rentalEndpoint}/contact`, "PUT");
    const cancelRental = useMutationApi<ISuccessResponse, Record<string, never>>(rentalEndpoint, "DELETE");

    useEffect(() => {
        setMode("view");
        if (!rental) {
            setEdit(null);
            return;
        }
        setEdit({
            user: rental.user,
            goodsId: rental.goodsId,
            count: rental.count,
            timeDue: toLocalInput(rental.timeDue),
            groupName: rental.groupName ?? "",
            contact: rental.contact ?? "",
            emergencyContact: rental.emergencyContact ?? "",
            usingLocation: rental.usingLocation ?? "",
            usingPurpose: rental.usingPurpose ?? "",
        });
    }, [rental]);

    if (!rental) {
        return (
            <SimpleDialog open={open} setOpen={setOpen}>
                <LoadingComponent />
            </SimpleDialog>
        );
    }

    const now = getNow();
    const canComplete = rental.status === RentalStatusEnum.ACTIVE || rental.status === RentalStatusEnum.RETURNED;
    const canEdit = rental.status === RentalStatusEnum.ACTIVE;
    const isUncontactedOverdue = rental.status === RentalStatusEnum.ACTIVE && rental.timeDue < now && rental.overdueContactedAt === 0;

    async function refresh(): Promise<void> {
        await refetchList();
        setMode("view");
    }

    async function saveEdit(): Promise<void> {
        if (!edit) return;
        const due = Temporal.PlainDateTime.from(edit.timeDue);
        await updateRental.mutateAsync({
            userId: edit.user.id,
            goodsId: edit.goodsId,
            count: edit.count,
            timeDue: getTime({
                year: due.year,
                month: due.month - 1,
                day: due.day,
                hour: due.hour,
                minute: due.minute,
            }),
            groupName: edit.groupName,
            contact: edit.contact,
            emergencyContact: edit.emergencyContact,
            usingLocation: edit.usingLocation,
            usingPurpose: edit.usingPurpose,
        });
        await refresh();
    }

    async function completeReturn(): Promise<void> {
        await confirmReturn.mutateAsync({});
        await refresh();
    }

    if (mode === "return") {
        return (
            <SimpleDialog open={open} setOpen={setOpen}>
                <ReturnChecklist
                    rental={rental}
                    onConfirm={() => void completeReturn()}
                    onCancel={() => setMode("view")}
                />
            </SimpleDialog>
        );
    }

    return (
        <SimpleDialog open={open} setOpen={setOpen}>
            <Dialog.Header>
                <HStack>
                    <IconButton rounded="sm" variant="ghost" onClick={() => void refresh()} size="sm">
                        <HiOutlineRefresh color="gray" />
                    </IconButton>
                    <Dialog.Title>{rental.goods.name} x {rental.count}</Dialog.Title>
                </HStack>
            </Dialog.Header>
            <Separator />
            <Dialog.Body px={8} py={4}>
                {mode === "edit" && edit ? (
                    <Stack gap={4}>
                        <Text fontWeight="semibold">대여자</Text>
                        <Text>{edit.user.nameKr} ({edit.user.studentNumber})</Text>
                        <StudentSearch onSelect={(user) => setEdit((value) => value ? { ...value, user } : value)} />
                        <Text fontWeight="semibold">물품</Text>
                        <select
                            value={edit.goodsId}
                            onChange={(event) => setEdit({ ...edit, goodsId: Number(event.target.value) })}
                        >
                            {(goods.data ?? []).map((item) => (
                                <option key={item.id} value={item.id}>{item.name} ({item.countNow}개 가능)</option>
                            ))}
                        </select>
                        <Input type="number" min={1} value={edit.count} onChange={(event) => setEdit({ ...edit, count: Number(event.target.value) })} />
                        <Input type="datetime-local" value={edit.timeDue} onChange={(event) => setEdit({ ...edit, timeDue: event.target.value })} />
                        <Input placeholder="단체" value={edit.groupName} onChange={(event) => setEdit({ ...edit, groupName: event.target.value })} />
                        <Input placeholder="연락처" value={edit.contact} onChange={(event) => setEdit({ ...edit, contact: event.target.value })} />
                        <Input placeholder="비상연락처" value={edit.emergencyContact} onChange={(event) => setEdit({ ...edit, emergencyContact: event.target.value })} />
                        <Input placeholder="사용 위치" value={edit.usingLocation} onChange={(event) => setEdit({ ...edit, usingLocation: event.target.value })} />
                        <Textarea placeholder="사용 사유" value={edit.usingPurpose} onChange={(event) => setEdit({ ...edit, usingPurpose: event.target.value })} />
                        <HStack justify="end">
                            <Button variant="outline" onClick={() => setMode("view")}>취소</Button>
                            <Button colorPalette="blue" onClick={() => void saveEdit()} loading={updateRental.isPending}>저장</Button>
                        </HStack>
                    </Stack>
                ) : (
                    <DataList.Root orientation={isWide ? "horizontal" : "vertical"}>
                        {isManager && (
                            <Center>
                                <HStack wrap="wrap">
                                    {canEdit && <Button variant="outline" onClick={() => setMode("edit")}>수정</Button>}
                                    {isUncontactedOverdue && (
                                        <Button colorPalette="orange" onClick={() => void contactOverdue.mutateAsync({}).then(refresh)}>연체 연락 완료</Button>
                                    )}
                                    {canComplete && <Button colorPalette="green" onClick={() => setMode("return")}>반납 처리</Button>}
                                    {canEdit && (
                                        <Button colorPalette="red" variant="outline" onClick={() => void cancelRental.mutateAsync({}).then(refresh)}>대여 취소</Button>
                                    )}
                                </HStack>
                            </Center>
                        )}
                        <Separator />
                        <DataListItem label="상태"><Badge>{getOperationalStatus(rental, now)}</Badge></DataListItem>
                        <DataListItem label="대여자">{rental.user.nameKr} ({rental.user.studentNumber})</DataListItem>
                        <DataListItem label="물품">{rental.goods.name} x {rental.count}</DataListItem>
                        <DataListItem label="대여 시각">{getString(rental.timeBorrow)}</DataListItem>
                        <DataListItem label="반납 기한">{getString(rental.timeDue)}</DataListItem>
                        <DataListItem label="반납 시각">{rental.timeReturn ? getString(rental.timeReturn) : "-"}</DataListItem>
                        <DataListItem label="단체">{rental.groupName || "-"}</DataListItem>
                        <DataListItem label="연락처">{rental.contact || "-"}</DataListItem>
                        <DataListItem label="비상연락처">{rental.emergencyContact || "-"}</DataListItem>
                        <DataListItem label="사용 위치">{rental.usingLocation || "-"}</DataListItem>
                        <DataListItem label="사용 사유">{rental.usingPurpose || "-"}</DataListItem>
                        <DataListItem label="대여 승인자">{rental.approver?.nameKr ?? "기록 없음"}</DataListItem>
                        <DataListItem label="반납 승인자">{rental.returnApprover?.nameKr ?? "-"}</DataListItem>
                        <DataListItem label="연체 연락">{rental.overdueContactedAt ? `${getString(rental.overdueContactedAt)} · ${rental.overdueContactedBy?.nameKr ?? "담당자 기록 없음"}` : "-"}</DataListItem>
                    </DataList.Root>
                )}
            </Dialog.Body>
            <Separator />
            <Dialog.Footer>
                {rental.status === RentalStatusEnum.ACTIVE && rental.certName !== RENTAL_CERTIFICATE_PENDING && (
                    <Link href={`${baseUrl}/rental/${rental.id}/certificate`}>
                        <Button variant="outline" colorPalette="blue">대여 확인서</Button>
                    </Link>
                )}
                <Dialog.ActionTrigger asChild>
                    <Button variant="outline" rounded="sm">닫기</Button>
                </Dialog.ActionTrigger>
            </Dialog.Footer>
        </SimpleDialog>
    );
}
