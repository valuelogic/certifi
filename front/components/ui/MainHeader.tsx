import { Box, Flex, Text } from "@chakra-ui/react";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import Link from "next/link";

export const MainHeader = () => {
  return (
    <Box as="header">
      <Flex alignItems="center" justifyContent="space-between">
        {/* <HStack> */}
        <Link href="/">
          <Text cursor="pointer">Home</Text>
        </Link>
        {/* <p>dsaasdssss</p> */}
        {/* </HStack> */}
        <ConnectButton />
      </Flex>
    </Box>
    // <div className={styles.topnav}>
    //   <a>Home</a>
    //   <a>Contact</a>
    //   <a>About</a>
    //   <a className={styles.login} onClick={() => handleAuth()}>
    //     Login
    //   </a>
    // </div>
  );
};

export default MainHeader;
