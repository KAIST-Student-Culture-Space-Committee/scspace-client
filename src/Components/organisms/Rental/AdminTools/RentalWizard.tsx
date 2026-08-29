"use client";

import { useState } from "react";
import {
    Box,
    Button,
    VStack,
    HStack,
    Text,
    Input,
    Textarea,
    Steps,
    Card,
    Separator,
    DataList,
    Stack,
} from "@chakra-ui/react";
import DataListItem from "@scspace-client/Components/atoms/DataListItem";
import FieldComponent from "@scspace-client/Components/atoms/Field";
import StudentSearch from "./StudentSearch";
import { IUser } from "@scspace-depot/types/user";
import { IGoods, IRentalCreateAdmin } from "@scspace-depot/types/rental";
import { useGoodsAPI } from "@scspace-client/Hooks/rental";
import { useMutationApi } from "@scspace-client/Hooks/api";
import LoadingComponent from "@scspace-client/Components/atoms/Loading";
import { Temporal } from "@js-temporal/polyfill";
import { dateUtils } from "@scspace-client/Hooks/utils";
import { RENTAL_DUTY_HOURS_KO } from "@scspace-depot/consts/rental.const";
import { AllOrganizationForm } from "@scspace-client/Components/organisms/Reservation/Forms/OrganizationAll";

interface RentalFormData {
    user: IUser | null;
    goods: IGoods | null;
    count: number;
    organizationId: number;
    phoneNumber: string;
    emergencyContactPresident: string;
    emergencyContactVicePresident: string;
    reasonLocation: string;
    reasonPurpose: string;
    timeDue: string;
}

function getDefaultDueTime(): string {
    return Temporal.Now.zonedDateTimeISO("Asia/Seoul")
        .add({ days: 7 })
        .with({ hour: 23, minute: 59, second: 0, millisecond: 0 })
        .toPlainDateTime()
        .toString({ smallestUnit: "minute" });
}

export default function RentalWizard() {
    const [step, setStep] = useState(0);
    const [formData, setFormData] = useState<RentalFormData>({
        user: null,
        goods: null,
        count: 1,
        organizationId: 0,
        phoneNumber: "",
        emergencyContactPresident: "",
        emergencyContactVicePresident: "",
        reasonLocation: "",
        reasonPurpose: "",
        timeDue: getDefaultDueTime(),
    });

    const { allGoods } = useGoodsAPI();
    const goodsList = allGoods.data || [];

    const createRentalMutation = useMutationApi<
        { success: boolean; data: { id: number } },
        IRentalCreateAdmin
    >("/rental/admin", "POST");

    const countIsValid = Boolean(
        formData.goods &&
        Number.isInteger(formData.count) &&
        formData.count >= 1 &&
        formData.count <= formData.goods.countNow,
    );
    const detailsAreValid = Boolean(
        formData.organizationId > 0 &&
        formData.phoneNumber.trim() &&
        formData.emergencyContactPresident.trim() &&
        formData.emergencyContactVicePresident.trim() &&
        formData.reasonLocation.trim() &&
        formData.reasonPurpose.trim() &&
        formData.timeDue,
    );

    const handleUserSelect = (user: IUser) => {
        setFormData((prev) => ({ ...prev, user }));
        setStep(1);
    };

    const handleGoodsSelect = (goods: IGoods) => {
        setFormData((prev) => ({ ...prev, goods, count: 1 }));
        setStep(2);
    };

    const handleDetailsSubmit = () => {
        if (!countIsValid || !detailsAreValid) {
            return;
        }
        setStep(3);
    };

    const handleFinalSubmit = async () => {
        if (!formData.user || !formData.goods || !countIsValid || !detailsAreValid) return;

        const due = Temporal.PlainDateTime.from(formData.timeDue);
        const timeDue = dateUtils().getTime({
            year: due.year,
            month: due.month - 1,
            day: due.day,
            hour: due.hour,
            minute: due.minute,
        });

        try {
            const payload: IRentalCreateAdmin = {
                userId: formData.user.id,
                goodsId: formData.goods.id,
                count: formData.count,
                timeDue,
                organizationId: formData.organizationId,
                phoneNumber: formData.phoneNumber,
                emergencyContactPresident: formData.emergencyContactPresident,
                emergencyContactVicePresident: formData.emergencyContactVicePresident,
                reasonLocation: formData.reasonLocation,
                reasonPurpose: formData.reasonPurpose,
            };

            await createRentalMutation.mutateAsync(payload);

            setFormData({
                user: null,
                goods: null,
                count: 1,
                organizationId: 0,
                phoneNumber: "",
                emergencyContactPresident: "",
                emergencyContactVicePresident: "",
                reasonLocation: "",
                reasonPurpose: "",
                timeDue: getDefaultDueTime(),
            });
            setStep(0);

            alert("Rental created successfully!");
        } catch (error) {
            console.error(error);
            alert(`Error creating rental: ${error instanceof Error ? error.message : "Unknown error"}`);
        }
    };

    const steps = [
        { title: "Select Student" },
        { title: "Select Goods" },
        { title: "Enter Details" },
        { title: "Review & Submit" },
    ];

    return (
        <VStack align="stretch" gap={6} p={4}>
            <Text color="fg.muted">
                대여 등록 가능 상근 시간: {RENTAL_DUTY_HOURS_KO}
            </Text>
            <Steps.Root
                count={steps.length}
                step={step}
                size="sm"
                colorPalette="blue"
            >
                {steps.map((s, index) => (
                    <Steps.Item key={index} index={index} title={s.title} />
                ))}
            </Steps.Root>

            <Card.Root>
                <Card.Body>
                    {step === 0 && (
                        <VStack align="stretch" gap={4}>
                            <Text fontSize="xl" fontWeight="bold">
                                Step 1: Select Student
                            </Text>
                            <StudentSearch onSelect={handleUserSelect} />
                        </VStack>
                    )}

                    {step === 1 && (
                        <VStack align="stretch" gap={4}>
                            <Text fontSize="xl" fontWeight="bold">
                                Step 2: Select Goods
                            </Text>
                            {formData.user && (
                                <Box p={3} bg="gray.50" borderRadius="md">
                                    <Text fontSize="sm" fontWeight="bold">
                                        Selected Student:
                                    </Text>
                                    <Text>
                                        {formData.user.nameKr} ({formData.user.studentNumber})
                                    </Text>
                                </Box>
                            )}
                            {!goodsList.length ? (
                                <LoadingComponent />
                            ) : (
                                <Stack gap={2}>
                                    {goodsList.map((goods) => {
                                        const canSelect = goods.countNow > 0;
                                        return (
                                            <Card.Root
                                                key={goods.id}
                                                variant="outline"
                                                cursor={canSelect ? "pointer" : "not-allowed"}
                                                onClick={() => canSelect && handleGoodsSelect(goods)}
                                                _hover={canSelect ? { bg: "gray.50" } : undefined}
                                                opacity={canSelect ? 1 : 0.6}
                                            >
                                                <Card.Body>
                                                    <HStack justify="space-between">
                                                        <VStack align="start" gap={1}>
                                                            <Text fontWeight="bold">{goods.name}</Text>
                                                            <Text fontSize="sm" color="gray.600">
                                                                {goods.description}
                                                            </Text>
                                                            <Text fontSize="sm" color="gray.500">
                                                                Available: {goods.countNow} / {goods.countAll}
                                                            </Text>
                                                        </VStack>
                                                        <Button
                                                            size="sm"
                                                            colorPalette="blue"
                                                            disabled={!canSelect}
                                                        >
                                                            {canSelect ? "Select" : "Out of stock"}
                                                        </Button>
                                                    </HStack>
                                                </Card.Body>
                                            </Card.Root>
                                        );
                                    })}
                                </Stack>
                            )}
                            <HStack justify="space-between">
                                <Button onClick={() => setStep(0)} variant="outline">
                                    Back
                                </Button>
                            </HStack>
                        </VStack>
                    )}

                    {step === 2 && (
                        <VStack align="stretch" gap={4}>
                            <Text fontSize="xl" fontWeight="bold">
                                Step 3: Enter Details
                            </Text>
                            {formData.goods && (
                                <Box p={3} bg="gray.50" borderRadius="md">
                                    <Text fontSize="sm" fontWeight="bold">
                                        Selected Goods:
                                    </Text>
                                    <Text>{formData.goods.name}</Text>
                                </Box>
                            )}
                            <FieldComponent
                                options={{
                                    label: "Quantity",
                                    required: true,
                                }}
                            >
                                <Input
                                    type="number"
                                    min={1}
                                    max={formData.goods?.countNow || 1}
                                    value={formData.count}
                                    onChange={(e) =>
                                        setFormData((prev) => ({
                                            ...prev,
                                            count: parseInt(e.target.value) || 1,
                                        }))
                                    }
                                />
                            </FieldComponent>
                            {!countIsValid && (
                                <Text color="red.500" fontSize="sm">
                                    Quantity must be between 1 and available stock.
                                </Text>
                            )}
                            <FieldComponent
                                options={{
                                    label: "Return Deadline",
                                    required: true,
                                }}
                            >
                                <Input
                                    type="datetime-local"
                                    value={formData.timeDue}
                                    onChange={(e) =>
                                        setFormData((prev) => ({
                                            ...prev,
                                            timeDue: e.target.value,
                                        }))
                                    }
                                />
                            </FieldComponent>
                            <FieldComponent
                                options={{
                                    label: "Organization",
                                    required: true,
                                }}
                            >
                                <AllOrganizationForm setOrgId={(value) => setFormData((prev) => ({ ...prev, organizationId: typeof value === "function" ? value(prev.organizationId) : value }))} />
                            </FieldComponent>
                            <FieldComponent
                                options={{
                                    label: "Contact",
                                    required: true,
                                }}
                            >
                                <Input
                                    value={formData.phoneNumber}
                                    onChange={(e) =>
                                        setFormData((prev) => ({
                                            ...prev,
                                            phoneNumber: e.target.value,
                                        }))
                                    }
                                    placeholder="Phone number or email"
                                />
                            </FieldComponent>
                            <FieldComponent
                                options={{
                                    label: "Emergency Contact",
                                    required: true,
                                }}
                            >
                                <Input
                                    value={formData.emergencyContactPresident}
                                    onChange={(e) =>
                                        setFormData((prev) => ({
                                            ...prev,
                                            emergencyContactPresident: e.target.value,
                                        }))
                                    }
                                    placeholder="President emergency contact"
                                />
                            </FieldComponent>
                            <FieldComponent options={{ label: "Vice President Emergency Contact", required: true }}>
                                <Input
                                    value={formData.emergencyContactVicePresident}
                                    onChange={(e) => setFormData((prev) => ({ ...prev, emergencyContactVicePresident: e.target.value }))}
                                    placeholder="Vice president emergency contact"
                                />
                            </FieldComponent>
                            <FieldComponent
                                options={{
                                    label: "Using Location",
                                    required: true,
                                }}
                            >
                                <Input
                                    value={formData.reasonLocation}
                                    onChange={(e) =>
                                        setFormData((prev) => ({
                                            ...prev,
                                            reasonLocation: e.target.value,
                                        }))
                                    }
                                    placeholder="Where will the goods be used?"
                                />
                            </FieldComponent>
                            <FieldComponent
                                options={{
                                    label: "Using Purpose",
                                    required: true,
                                }}
                            >
                                <Textarea
                                    value={formData.reasonPurpose}
                                    onChange={(e) =>
                                        setFormData((prev) => ({
                                            ...prev,
                                            reasonPurpose: e.target.value,
                                        }))
                                    }
                                    placeholder="Purpose of rental"
                                    rows={3}
                                />
                            </FieldComponent>
                            <HStack justify="space-between">
                                <Button onClick={() => setStep(1)} variant="outline">
                                    Back
                                </Button>
                                <Button
                                    onClick={handleDetailsSubmit}
                                    colorPalette="blue"
                                    disabled={!countIsValid || !detailsAreValid}
                                >
                                    Next
                                </Button>
                            </HStack>
                        </VStack>
                    )}

                    {step === 3 && (
                        <VStack align="stretch" gap={4}>
                            <Text fontSize="xl" fontWeight="bold">
                                Step 4: Review & Submit
                            </Text>
                            <DataList.Root>
                                <DataListItem label="Student">
                                    {formData.user
                                        ? `${formData.user.nameKr} (${formData.user.studentNumber})`
                                        : "N/A"}
                                </DataListItem>
                                <DataListItem label="Email">
                                    {formData.user?.email || "N/A"}
                                </DataListItem>
                                <Separator />
                                <DataListItem label="Goods">
                                    {formData.goods?.name || "N/A"}
                                </DataListItem>
                                <DataListItem label="Quantity">
                                    {formData.count}
                                </DataListItem>
                                <DataListItem label="Return Deadline">
                                    {formData.timeDue.replace("T", " ")}
                                </DataListItem>
                                <Separator />
                                <DataListItem label="Organization ID">
                                    {formData.organizationId || "N/A"}
                                </DataListItem>
                                <DataListItem label="Contact">
                                    {formData.phoneNumber || "N/A"}
                                </DataListItem>
                                <DataListItem label="President Emergency Contact">
                                    {formData.emergencyContactPresident || "N/A"}
                                </DataListItem>
                                <DataListItem label="Vice President Emergency Contact">
                                    {formData.emergencyContactVicePresident || "N/A"}
                                </DataListItem>
                                <DataListItem label="Using Location">
                                    {formData.reasonLocation || "N/A"}
                                </DataListItem>
                                <DataListItem label="Using Purpose">
                                    {formData.reasonPurpose || "N/A"}
                                </DataListItem>
                            </DataList.Root>
                            <HStack justify="space-between">
                                <Button onClick={() => setStep(2)} variant="outline">
                                    Back
                                </Button>
                                <Button
                                    onClick={handleFinalSubmit}
                                    colorPalette="green"
                                    loading={createRentalMutation.isPending}
                                    disabled={!formData.user || !formData.goods || !countIsValid || !detailsAreValid}
                                >
                                    Submit Rental
                                </Button>
                            </HStack>
                        </VStack>
                    )}
                </Card.Body>
            </Card.Root>
        </VStack>
    );
}
