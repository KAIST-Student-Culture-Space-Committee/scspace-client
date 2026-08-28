"use client"

import Scroll from "@scspace-client/Components/molecules/page/Scroll";
import GoodsList from "@scspace-client/Components/organisms/Rental/GoodsList";

export default function RentalApplication() {
    return (
        <Scroll>
            <GoodsList disabled />
        </Scroll>
    );
}
