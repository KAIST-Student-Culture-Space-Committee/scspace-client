"use client";

import { useState } from "react";
import {
    Box,
    Button,
    VStack,
    HStack,
    Text,
    Textarea,
    Checkbox,
    Stack,
    Dialog,
    Separator,
} from "@chakra-ui/react";
import { IRentalAll } from "@scspace-depot/types/rental";
import DataListItem from "@scspace-client/Components/atoms/DataListItem";
import { dateUtils } from "@scspace-client/Hooks/utils";

interface ReturnChecklistProps {
    rental: IRentalAll;
    onConfirm: () => void;
    onCancel: () => void;
}

export default function ReturnChecklist({
    rental,
    onConfirm,
    onCancel,
}: ReturnChecklistProps) {
    const { getString } = dateUtils();
    const [checks, setChecks] = useState({
        goodsCondition: false,
        correctQuantity: false,
        noDamages: false,
        userNotified: false,
        documentationComplete: false,
    });
    const [notes, setNotes] = useState("");

    const allChecked = Object.values(checks).every((v) => v);

    const handleCheckChange = (key: keyof typeof checks) => {
        setChecks((prev) => ({ ...prev, [key]: !prev[key] }));
    };

    const handleConfirm = () => {
        if (!allChecked) return;
        onConfirm();
    };

    return (
        <VStack align="stretch" gap={4}>
            <Dialog.Header>
                <Dialog.Title>Confirm Return - {rental.goods.name}</Dialog.Title>
            </Dialog.Header>
            <Separator />
            <Dialog.Body px={8} py={4}>
                <VStack align="stretch" gap={4}>
                    <Box p={3} bg="gray.50" borderRadius="md">
                        <Stack gap={2}>
                            <DataListItem label="User">
                                {rental.user.nameKr} ({rental.user.studentNumber})
                            </DataListItem>
                            <DataListItem label="Goods">
                                {rental.goods.name} x {rental.count}
                            </DataListItem>
                            <DataListItem label="Borrowed">
                                {getString(rental.timeBorrow)}
                            </DataListItem>
                            <DataListItem label="Due">
                                {getString(rental.timeDue)}
                            </DataListItem>
                            {rental.timeReturn !== 0 && (
                                <DataListItem label="Returned">
                                    {getString(rental.timeReturn)}
                                </DataListItem>
                            )}
                        </Stack>
                    </Box>

                    <Text fontWeight="bold" fontSize="lg">
                        Verification Checklist
                    </Text>

                    <Stack gap={3}>
                        <Checkbox.Root
                            checked={checks.goodsCondition}
                            onCheckedChange={() => handleCheckChange("goodsCondition")}
                        >
                            <Checkbox.HiddenInput />
                            <Checkbox.Control />
                            <Checkbox.Label>
                                Verified goods returned in good condition
                            </Checkbox.Label>
                        </Checkbox.Root>
                        <Checkbox.Root
                            checked={checks.correctQuantity}
                            onCheckedChange={() => handleCheckChange("correctQuantity")}
                        >
                            <Checkbox.HiddenInput />
                            <Checkbox.Control />
                            <Checkbox.Label>
                                Verified correct quantity returned ({rental.count} items)
                            </Checkbox.Label>
                        </Checkbox.Root>
                        <Checkbox.Root
                            checked={checks.noDamages}
                            onCheckedChange={() => handleCheckChange("noDamages")}
                        >
                            <Checkbox.HiddenInput />
                            <Checkbox.Control />
                            <Checkbox.Label>
                                Checked for any damages or missing parts
                            </Checkbox.Label>
                        </Checkbox.Root>
                        <Checkbox.Root
                            checked={checks.userNotified}
                            onCheckedChange={() => handleCheckChange("userNotified")}
                        >
                            <Checkbox.HiddenInput />
                            <Checkbox.Control />
                            <Checkbox.Label>
                                User notified of return confirmation
                            </Checkbox.Label>
                        </Checkbox.Root>
                        <Checkbox.Root
                            checked={checks.documentationComplete}
                            onCheckedChange={() => handleCheckChange("documentationComplete")}
                        >
                            <Checkbox.HiddenInput />
                            <Checkbox.Control />
                            <Checkbox.Label>
                                All documentation completed
                            </Checkbox.Label>
                        </Checkbox.Root>
                    </Stack>

                    <Box>
                        <Text fontWeight="semibold" mb={2}>
                            Admin Notes (Optional)
                        </Text>
                        <Textarea
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            placeholder="Add any notes about the return condition or process..."
                            rows={3}
                        />
                    </Box>
                </VStack>
            </Dialog.Body>
            <Separator />
            <Dialog.Footer>
                <HStack justify="space-between" width="full">
                    <Button onClick={onCancel} variant="outline">
                        Cancel
                    </Button>
                    <Button
                        onClick={handleConfirm}
                        colorPalette="green"
                        disabled={!allChecked}
                    >
                        Confirm Return
                    </Button>
                </HStack>
            </Dialog.Footer>
        </VStack>
    );
}
