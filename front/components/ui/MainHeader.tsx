import { Box, Flex, Text } from "@chakra-ui/react";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import Link from "next/link";

export const MainHeader = () => {
  return (
    <Box as="header">
      <Flex alignItems="center" justifyContent="space-between">
        <Link href="/">
          <Text cursor="pointer">Home</Text>
        </Link>
        <ConnectButton />
      </Flex>
    </Box>
  );
};

export default MainHeader;
