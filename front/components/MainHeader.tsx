import { Box, Flex, Link } from "@chakra-ui/react";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import NextLink from "next/link";

export const MainHeader = () => {
  return (
    <Box as="header">
      <Flex alignItems="center" justifyContent="space-between">
        <Link as={NextLink} href="/">Home</Link>
        <ConnectButton />
      </Flex>
    </Box>
  );
};

export default MainHeader;
