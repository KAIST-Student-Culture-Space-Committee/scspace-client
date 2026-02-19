"use client"

import Scroll from "@scspace-client/Components/molecules/page/Scroll";
import GoodsList from "@scspace-client/Components/organisms/Rental/GoodsList";
import { Alert, Box } from "@chakra-ui/react";

export default function RentalApplication() {
    return (
        <Scroll>
            <Box p={4}>
                <Alert.Root status="info" mb={4}>
                    <Alert.Indicator />
                    <Alert.Content>
                        <Alert.Title>Rental Process Changed</Alert.Title>
                        <Alert.Description>
                            User self-service rental has been disabled. 
                            Please contact an administrator to create a rental request.
                            You can view available goods below.
                        </Alert.Description>
                    </Alert.Content>
                </Alert.Root>
            </Box>
            <GoodsList disabled />
        </Scroll>
    );
}
