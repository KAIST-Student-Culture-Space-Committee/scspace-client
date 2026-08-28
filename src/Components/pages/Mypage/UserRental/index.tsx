"use client"

import { useAuth } from "@scspace-client/Hooks/auth";
import Scroll from "@scspace-client/Components/molecules/page/Scroll";
import LoadingComponent from "@scspace-client/Components/atoms/Loading";
import RentalTable from "@scspace-client/Components/organisms/Rental/RentalList/RentalTable";
import { useRentalAPI } from "@scspace-client/Hooks/rental";
import SimplePagination from "@scspace-client/Components/molecules/page/SimplePagenation";
import { Center, Grid } from "@chakra-ui/react";
import { useState } from "react";

export default function UserRental() {
    const { needLogin } = useAuth();
    needLogin();

    const [page, setPage] = useState(1);
    const limit = 50;
    const { data: rentals, refetch } = useRentalAPI({
        view: "my",
        limit,
        offset: limit * (page - 1),
    }).myRentals;

    return (
        <Scroll>
            {rentals ? (
                <Grid height="100%" templateRows="1fr auto" gap={2}>
                    <RentalTable
                        rentals={rentals.data}
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
                </Grid>
            ) : (
                <LoadingComponent />
            )}
        </Scroll >
    );
}
