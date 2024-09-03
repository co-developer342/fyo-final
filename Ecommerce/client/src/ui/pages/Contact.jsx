import React, { useState } from "react";
import { Box, Button, Flex, Input, Text, Textarea } from "@chakra-ui/react";
import BGImg from "../assets/images/Screenshot 2024-08-05 122640.png";
import { FormControl, FormLabel } from "@chakra-ui/react";
import { useToast } from "@chakra-ui/react";
import NavBar from '../components/navBar';
import Footer from '../components/Footer';
import axios from "axios";

function ContactUs() {
  const [name, setName] = useState("");
  const [subject, setSubject] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const toast = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("/api/v1/contact", {
        name,
        subject,
        email,
        message,
      });

      toast({
        title: "Message Sent Successfully",
        description: res.data.message, // Corrected this line
        status: "success",
        duration: 2000,
        isClosable: true,
        position: "top-right",
      });
      setName("");
      setSubject("");
      setEmail("");
      setMessage("");

    } catch (error) {
      console.log(error);
      toast({
        title: "Error",
        description: "Something went wrong. Please try again later.",
        status: "error",
        duration: 2000,
        isClosable: true,
        position: "top-right",
      });
    }
  };

  return (
    <>
      <NavBar />
      <Box
        minH={"calc(100vh - 200px)"} // Ensure the form area has enough space
        bgImg={BGImg}
        bgPosition={"center"}
        bgRepeat={"no-repeat"}
        bgSize={"cover"}
        display={"flex"}
        justifyContent={"center"}
        alignItems={"center"}
        p={4}
      >
        <Flex
          rounded={20}
          p={8}
          color={"white"}
          backdropFilter={"blur(10px) brightness(150%)"} // Adjusted for better visibility
          bg={"whiteAlpha.200"} // Slightly more opaque for better contrast
          flexDir={"column"}
          w={{ base: "90%", md: "50%", lg: "40%" }}
          maxW={"800px"}
          boxShadow={"lg"}
          
        >
          <Box my={5} textAlign={"center"}>
            <Text as={"h1"} fontSize={"4xl"} fontWeight={"bold"}>
              Contact Us
            </Text>
          </Box>
          <FormControl as="form" onSubmit={handleSubmit}>
            <Box mb={6}>
              <FormLabel fontSize={"md"} color={"white"}>
                Your Name
              </FormLabel>
              <Input
                placeholder="Your Name*"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </Box>
            <Box mb={6}>
              <FormLabel fontSize={"md"} color={"white"}>
                Subject
              </FormLabel>
              <Input
                placeholder="Your Subject*"
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                required
              />
            </Box>
            <Box mb={6}>
              <FormLabel fontSize={"md"} color={"white"}>
                Your Email
              </FormLabel>
              <Input
                placeholder="Your Email*"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </Box>
            <Box mb={6}>
              <FormLabel fontSize={"md"} color={"white"}>
                Your Message
              </FormLabel>
              <Textarea
                placeholder="Your Message*"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                required
              />
            </Box>
            <Button type="submit" colorScheme="red" w={"full"}>
              Send Message
            </Button>
          </FormControl>
        </Flex>
      </Box>
      <Footer />
    </>
  );
}

export default ContactUs;
