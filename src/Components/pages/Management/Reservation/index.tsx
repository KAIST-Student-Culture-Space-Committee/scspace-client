"use client";

import { Button, Center, HStack, Tabs, Text } from "@chakra-ui/react";
import LoadingComponent from "@scspace-client/Components/atoms/Loading";
import SimpleTable from "@scspace-client/Components/atoms/SimpleTable";
import Scroll from "@scspace-client/Components/molecules/page/Scroll";
import AllReservation from "@scspace-client/Components/organisms/Reservation/Listing/AllReservation";
import CreateReservation from "@scspace-client/Components/organisms/Reservation/Manager/CreateReservation";
import { useReservationApprovalAPI } from "@scspace-client/Hooks/reservation";
import { dateUtils } from "@scspace-client/Hooks/utils";
import { ReservationStateEnum } from "@scspace-depot/enums/reservation.enum";
import React from "react";

function ReservationApproval() {
    const { pendingReservations, updateApproval } = useReservationApprovalAPI();
    const { getString } = dateUtils();

    function update(id: number, state: ReservationStateEnum.GRANT | ReservationStateEnum.REJECTED) {
        updateApproval({ id, state }, {
            onSuccess: () => pendingReservations.refetch(),
            onError: (error) => alert(error.message),
        });
    }

    if (pendingReservations.isLoading) {
        return <LoadingComponent />;
    }

    if (!pendingReservations.data || pendingReservations.data.length === 0) {
        return (
            <Center minHeight="240px">
                <Text color="fg.muted">There are no reservations awaiting approval.</Text>
            </Center>
        );
    }

    return (
        <SimpleTable
            header={["Title", "Approval", "Booker", "Time"]}
            content={pendingReservations.data.map((reservation) => ({
                id: reservation.id,
                row: [
                    reservation.title,
                    <HStack key={reservation.id}>
                        <Button
                            size="xs"
                            colorPalette="green"
                            onClick={() => update(reservation.id, ReservationStateEnum.GRANT)}
                        >
                            Approve
                        </Button>
                        <Button
                            size="xs"
                            colorPalette="red"
                            variant="outline"
                            onClick={() => update(reservation.id, ReservationStateEnum.REJECTED)}
                        >
                            Reject
                        </Button>
                    </HStack>,
                    reservation.organizationId === 1
                        ? reservation.user.nameKr
                        : reservation.organization.name,
                    `${getString(reservation.timeFrom)} - ${getString(reservation.timeTo)}`,
                ],
            }))}
        />
    );
}

export default function ManageReservation() {
    const tabList: { [key: string]: React.ReactNode } = {
        History: <AllReservation />,
        Approval: <ReservationApproval />,
        Create: <CreateReservation />,
    };

    return (
        <Scroll>
            <Tabs.Root defaultValue={Object.keys(tabList)[0]} fitted minHeight={"full"}>
                <Tabs.List>
                    {Object.keys(tabList).map((key) => (
                        <Tabs.Trigger key={key} value={key}>
                            {key}
                        </Tabs.Trigger>
                    ))}
                </Tabs.List>
                {Object.entries(tabList).map(([key, content]) => (
                    <Tabs.Content key={key} value={key} minHeight={"full"}>
                        {content}
                    </Tabs.Content>
                ))}
            </Tabs.Root>
        </Scroll>
    );
}
