"use client"

import {
    Flex,
    Text,
    Grid,
    useBreakpointValue,
    Tabs
} from "@chakra-ui/react";
import { useEffect, useState, } from "react";

import { dateUtils } from "@scspace-client/Hooks/utils";
import SimpleTable from "@scspace-client/Components/atoms/SimpleTable";
import Scroll from "@scspace-client/Components/molecules/page/Scroll";
import { IRentalAll } from "@scspace-depot/types/rental";
import RefetchBtn from "@scspace-client/Components/molecules/buttons/RefetchBtn";
import RentalDialog from "./RentalDialog";
import { RentalStatusEnum } from "@scspace-depot/enums/rental.enum";

export default function RentalTable({
    disabled,
    rentals,
    refetch,
    helperText,
    showTabs
}: {
    helperText?: string;
    disabled?: boolean;
    rentals: IRentalAll[];
    refetch: () => void;
    showTabs?: boolean;
}) {
    const [selected, setSelected] = useState<number | null>(null);

    const [open, setOpen] = useState<boolean>(false);

    const { getString } = dateUtils();

    const isWide = useBreakpointValue({ base: false, md: true });

    const RENTAL_STATE = {
        ALL: "all",
        ON_RENT: "on rent",
        OVERDUE: "overdue",
        CONTACTED: "contacted",
        COMPLETED: "completed",
        CANCELLED: "cancelled",
    };

    const [tab, setTab] = useState<string>(RENTAL_STATE.ALL);

    const { getNow } = dateUtils();
    const [now, setNow] = useState<number>(() => getNow());

    useEffect(() => {
        const timer = window.setInterval(() => setNow(getNow()), 60_000);
        return () => window.clearInterval(timer);
    }, [getNow]);

    return (
        <>
            <Grid
                height="100%"
                templateRows="auto 1fr"
                gap={2}
            >
                <Flex
                    width="100%"
                    justify={isWide ? "space-between" : "end"}
                    alignItems="end"
                >
                    {isWide && (showTabs ? (
                        <Tabs.Root
                            value={tab}
                            onValueChange={(e) => setTab(e.value)}
                        >
                            <Tabs.List>
                                <Tabs.Trigger value={RENTAL_STATE.ALL}>
                                    All
                                </Tabs.Trigger>
                                <Tabs.Trigger value={RENTAL_STATE.ON_RENT}>
                                    On Rent
                                </Tabs.Trigger>
                                <Tabs.Trigger value={RENTAL_STATE.OVERDUE}>
                                    Overdue
                                </Tabs.Trigger>
                                <Tabs.Trigger value={RENTAL_STATE.CONTACTED}>
                                    Contacted
                                </Tabs.Trigger>
                                <Tabs.Trigger value={RENTAL_STATE.COMPLETED}>
                                    Completed
                                </Tabs.Trigger>
                                <Tabs.Trigger value={RENTAL_STATE.CANCELLED}>
                                    Cancelled
                                </Tabs.Trigger>
                            </Tabs.List>
                        </Tabs.Root>
                    ) : (
                        <Text margin={0} color="gray.focusRing">
                            {helperText ? (
                                helperText
                            ) : (
                                "Click each row to see detail of rental history"
                            )}
                        </Text>
                    ))}
                    <RefetchBtn refetch={refetch} />
                </Flex>
                <Scroll>
                    <SimpleTable
                        onIdChange={!disabled ? (
                            (id: number) => {
                                setSelected(id);
                                setOpen(true);
                            }
                        ) : (undefined)}
                        header={[
                            "Goods",
                            "Borrower",
                            "Return Due",
                            "Status",
                        ]}
                        content={rentals
                            .filter(rental => {
                                switch (tab) {
                                    case RENTAL_STATE.ALL:
                                        return true;
                                    case RENTAL_STATE.COMPLETED:
                                        return rental.status === RentalStatusEnum.COMPLETED;
                                    case RENTAL_STATE.CANCELLED:
                                        return rental.status === RentalStatusEnum.CANCELLED;
                                    case RENTAL_STATE.CONTACTED:
                                        return rental.status === RentalStatusEnum.ACTIVE && rental.timeDue < now && rental.overdueContactedAt > 0;
                                    case RENTAL_STATE.OVERDUE:
                                        return rental.status === RentalStatusEnum.ACTIVE && rental.timeDue < now && rental.overdueContactedAt === 0;
                                    default:
                                        return rental.status === RentalStatusEnum.ACTIVE && rental.timeDue >= now;
                                }
                            })
                            .map((rental: IRentalAll) => ({
                                id: rental.id,
                                row: [
                                    `${rental.goods.name} x ${rental.count}`,
                                    `${rental.user.nameKr} (${rental.user.studentNumber})`,
                                    getString(rental.timeDue),
                                    rental.status === RentalStatusEnum.COMPLETED
                                        ? "정상 반납"
                                        : rental.status === RentalStatusEnum.CANCELLED
                                            ? "취소"
                                            : rental.status === RentalStatusEnum.RETURNED
                                                ? "반납 확인 대기"
                                                : rental.timeDue < now
                                                    ? rental.overdueContactedAt > 0 ? "연체 후 연락" : "연체"
                                                    : "대여",
                                ]
                            }))
                        }
                    />
                </Scroll>
            </Grid>
            <RentalDialog
                open={open}
                setOpen={setOpen}
                rental={rentals.find(rental => rental.id === selected) ?? null}
                refetchList={refetch}
            />
        </>
    );
}
