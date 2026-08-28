import { Badge, Blockquote, Field, Fieldset, Heading, Stack, Text } from "@chakra-ui/react";
import SimpleLink from "@scspace-client/Components/atoms/SimpleLink";
import { BlueMark, RedMark } from "../utils";
import { RENTAL_DUTY_HOURS_KO } from "@scspace-depot/consts/rental.const";

export default function RentalRule() {
    return (
        <Fieldset.Root>
            <Fieldset.Legend>
                <Heading whiteSpace={"break-spaces"}>
                    Rental Rules
                </Heading>
            </Fieldset.Legend>
            <Fieldset.HelperText>
                대여 관련 세칙 및 안내사항
            </Fieldset.HelperText>
            <Fieldset.Content>
                <Field.Root>
                    <Field.Label>
                        대여란?
                    </Field.Label>
                    <Blockquote.Root>
                        <Blockquote.Content>
                            <Stack>
                                <Text>
                                    물품 대여는 공간위원회 상근 시간에 공간위실을 방문하여 진행합니다.
                                </Text>
                                <Text>
                                    의자, 책상 및 다양한 물품들을 대여할 수 있으며, 대여 가능한 물품들은 <SimpleLink href="/rental/application" text="찾아보기 > 대여" />에서 확인할 수 있습니다.
                                </Text>
                            </Stack>
                        </Blockquote.Content>
                    </Blockquote.Root>
                </Field.Root>
                <Field.Root>
                    <Field.Label>
                        대여 규칙
                    </Field.Label>
                    <Blockquote.Root>
                        <Blockquote.Content>
                            <Stack>
                                <Text>
                                    대여 가능 시간은 <BlueMark>{RENTAL_DUTY_HOURS_KO}</BlueMark>입니다. 이외의 시간에는 대여가 불가능할 수 있습니다.
                                </Text>
                                <Text>
                                    공간위원이 대여자와 물품, 수량, 사용 목적 및 반납 기한을 확인한 뒤 현장에서 대여를 등록합니다.
                                </Text>
                                <Text>
                                    반납은 상근 시간에 물품을 가져오면 공간위원이 체크리스트를 확인한 뒤 완료 처리합니다. 대여 내역과 기한은 <SimpleLink href="/mypage/rental" text="마이페이지 > 대여" />에서 확인할 수 있습니다.
                                </Text>
                            </Stack>
                        </Blockquote.Content>
                    </Blockquote.Root>
                </Field.Root>
                <Field.Root>
                    <Field.Label>
                        대여 관련 유의사항
                    </Field.Label>
                    <Blockquote.Root>
                        <Blockquote.Content>
                            <Stack>
                                <Text>
                                    반납 기한 안에 반납하지 않을 시, <RedMark>연체 일수에 비례하여 대여 신청이 제한</RedMark>됩니다.
                                </Text>
                                <Text>
                                    연체 일수는 반납 기한으로부터 실제 반납일까지의 날짜로 계산하며, 실제 반납 일수로부터 연체 일수만큼 대여 신청이 제한됩니다.
                                </Text>
                                <Text>
                                    <RedMark>물품 분실 혹은 손상 시 공간위가 배상을 청구할 수 있습니다.</RedMark>
                                </Text>
                            </Stack>
                        </Blockquote.Content>
                    </Blockquote.Root>
                </Field.Root>
            </Fieldset.Content>
        </Fieldset.Root >
    );
}
