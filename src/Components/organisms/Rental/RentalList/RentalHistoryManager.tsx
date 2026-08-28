"use client"

import { useAuth } from "@scspace-client/Hooks/auth";
import LoadingComponent from "@scspace-client/Components/atoms/Loading";
import RentalTable from "@scspace-client/Components/organisms/Rental/RentalList/RentalTable";
import { useRentalAPI } from "@scspace-client/Hooks/rental";
import SimplePagination from "@scspace-client/Components/molecules/page/SimplePagenation";
import { Center, Grid } from "@chakra-ui/react";
import { useState } from "react";

export default function RentalHistoryManager() {
    const { needManager } = useAuth();
    needManager();

    const [page, setPage] = useState(1);
    const limit = 50;
    const { data: rentals, refetch } = useRentalAPI({
        view: "all",
        limit,
        offset: limit * (page - 1),
    }).allRentals;

    return (
        <Grid height="100%" templateRows="1fr auto" gap={2}>
            {rentals ? (
                <>
                    <RentalTable
                        rentals={rentals.data ?? []}
                        refetch={refetch}
                        showTabs
                    />
                    <Center>
                        <SimplePagination
                            count={rentals.count}
                            pageSize={limit}
                            page={page}
                            onPageChange={({ page: nextPage }) => setPage(nextPage)}
                        />
                    </Center>
                </>
            ) : (
                <LoadingComponent />
            )}
        </Grid>
    );
}
