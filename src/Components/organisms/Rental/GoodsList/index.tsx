"use client"

import { Alert, Box, Center, CheckboxCard, Grid, Separator, Stack, useBreakpointValue } from "@chakra-ui/react";
import LoadingComponent from "@scspace-client/Components/atoms/Loading";
import { useGoodsAPI } from "@scspace-client/Hooks/rental";
import { useState } from "react";
import ManageBar from "../ManageGoods/ManageBar";
import Scroll from "@scspace-client/Components/molecules/page/Scroll";
import GoodsListItem from "./GoodsListItem";

export interface ICartItem {
    id: number;
    name: string;
    count: number;
    countNow: number;
}

export default function GoodsList(props: {
    disabled?: boolean;
    manage?: boolean;
}) {
    const disabled = props.disabled ?? false;
    const manage = props.manage ?? false;
    const isWide = useBreakpointValue({ base: false, md: true });

    const {
        allGoods: {
            data: goodsListData,
            refetch: goodsListRefetch
        }
    } = useGoodsAPI();

    const [selected, setSelected] = useState<number | null>(null);

    return (!goodsListData) ? (
        <LoadingComponent />
    ) : (<>
        {manage && (
            <ManageBar
                item={goodsListData.find(item => item.id === selected) ?? null}
                onChange={goodsListRefetch}
            />
        )}
        <Grid templateRows={"1fr auto"} height={"100%"}>
            <Scroll>
                <Stack p={2}>
                    {!manage && (
                        <Alert.Root status={"info"}>
                            <Alert.Indicator />
                            <Alert.Content>
                                <Alert.Title>물품 대여는 공간위원회 상근 시간에만 가능합니다.</Alert.Title>
                                <Alert.Description>공간위실에 방문하면 공간위원이 현장에서 대여를 등록합니다.</Alert.Description>
                            </Alert.Content>
                        </Alert.Root>
                    )}
                    {goodsListData.map(item => (
                        <GoodsListItem
                            key={`${item.name}-${item.id}`}
                            item={item}
                            isSelected={selected === item.id}
                            onSelect={id => setSelected((s) => s === id ? null : id)}
                            disabled={disabled}
                            manage={manage}
                            isWide={isWide ?? false}
                        />
                    ))}
                </Stack>
            </Scroll>
        </Grid>
    </>);
}
