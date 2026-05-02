"use client";

import { Box, Button, Card, Center, CloseButton, Dialog, DialogPositioner, HStack, Mark, Portal, Separator, Stack, StackSeparator, Tabs, Text, useBreakpointValue } from "@chakra-ui/react";
import Scroll from "../../molecules/page/Scroll";
import PrivacyPolicy from "../../organisms/Login/PrivacyPolicy";
import { useState } from "react";
import Image from "next/image";
import TooltipComponent from "../../atoms/Tooptip";
import { useSearchParams,useRouter } from "next/navigation";
import { useEffect } from "react";

const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";

export default function SSOLogin() {

    const searchParams = useSearchParams();
    const router = useRouter();

    const [privacyConsentOpen, setPrivacyConsentOpen] = useState(false);
    const [consentToken, setConsentToken] = useState<string | null>(null);

    const isWide = useBreakpointValue({ base: false, md: true });

    useEffect(() => {

        const privacyConsentRequired = searchParams.get('privacyConsentRequired');
        const token = searchParams.get('token');

        if (privacyConsentRequired === 'true' && token) {
            setConsentToken(token);
            setPrivacyConsentOpen(true);
            router.replace('/login');
        }
    }, [searchParams,router]);

    const handleLogin = async () => {
        try {
            const res = await fetch(`${baseUrl}/auth/login-url`, {
                credentials: "include",
            });
            if (!res.ok) {
                throw new Error('Failed to get login URL');
            }
            const { loginUrl } = await res.json();
            window.location.href = loginUrl;
        } catch (error) {
            console.error("Login failed:", error);
            // Optionally, show an error message to the user
        }
    };

    const handleAcceptPrivacyConsent = async () => {
        if (!consentToken) {
            console.error("Consent token is missing");
            return;
        }

        try {
            console.log("Accepting privacy consent with token:", consentToken);
            const res = await fetch(`${baseUrl}/auth/accept-privacy-consent`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ consentToken }),
                credentials: "include",
            });
            
            if (!res.ok) {
                throw new Error('Failed to accept privacy consent');
            }

            setPrivacyConsentOpen(false);
            setConsentToken(null);
            router.replace('/'); 
        } catch (error) {
            console.error("Failed to accept privacy consent:", error);
            // Optionally, show an error message to the user
        }
    }

    return (
        <Dialog.Root size={"full"} scrollBehavior="inside" open={privacyConsentOpen} onOpenChange={(details) => { setPrivacyConsentOpen(details.open) }}>
            <Portal>
                <Tabs.Root defaultValue="Eng">
                    <Dialog.Positioner>
                        <PrivacyPolicy onRead={handleAcceptPrivacyConsent} />
                    </Dialog.Positioner>
                </Tabs.Root>
            </Portal>
            <Scroll>
                <Card.Root height="100%">
                    <Card.Body>
                        <HStack separator={<StackSeparator />} width="100%" height="100%" gap={6}>
                            {isWide && (
                                <Box width="100%" height="100%" position="relative">
                                    <Image
                                        fill
                                        style={{ objectFit: "cover" }}
                                        src="/img/testimonials-bg.jpg"
                                        alt="Business"
                                    />
                                </Box>
                            )}
                            <Center width="100%" height="100%">
                                <Card.Root borderColor="fg.success">
                                    <Card.Header gap={4}>
                                        <Card.Title>
                                            KAIST SSO LOGIN
                                        </Card.Title>
                                        <Stack color="fg.subtle" fontSize="sm" gap={0}>
                                            {isWide && (
                                                <Card.Description>
                                                    KAIST 학생문화공간위원회 사이트는 KAIST SSO (Pass-Ni) 로그인만을 지원합니다.
                                                </Card.Description>
                                            )}
                                            <Card.Description>
                                                The KAIST SCSpace website only supports KAIST SSO (Pass-Ni) login.
                                            </Card.Description>
                                        </Stack>
                                        <TooltipComponent
                                            content={(
                                                <Text>
                                                    {
                                                        "Click to login with KAIST SSO"
                                                    }
                                                </Text>
                                            )}
                                        >
                                            <Button bg={{ base: "#01438F", _disabled: "fg.error" }} fontWeight={{ base: "semibold", _hover: "bold" }} onClick={handleLogin} >
                                                Login as a KAIST SSO
                                            </Button>
                                        </TooltipComponent>
                                    </Card.Header>
                                    <Card.Body />
                                    
                                </Card.Root>
                            </Center>
                        </HStack>
                    </Card.Body>
                </Card.Root>
            </Scroll>
        </Dialog.Root >
    )
}