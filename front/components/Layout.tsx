import { Box } from "@chakra-ui/react";
import MainHeader from "./MainHeader";

const Layout = (props) => {
  return (
    <Box height={"100%"}>
      <MainHeader />
      <Box>{props.children}</Box>
    </Box>
  );
};

export default Layout;
