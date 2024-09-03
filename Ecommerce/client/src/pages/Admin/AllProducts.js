import React, { useState, useEffect } from "react";
import AdminMenu from "../../components/Layout/AdminMenu";
import Layout from "./../../components/Layout/Layout";
import toast from "react-hot-toast";
import axios from "axios";
import { Link } from "react-router-dom";
import { Box, Card, CardBody, Heading, Image, Stack, Text, Tooltip } from "@chakra-ui/react";

const AllProducts = () => {
  const [products, setProducts] = useState([]);

  const getAllProducts = async () => {
    try {
      const { data } = await axios.get('/api/v1/product/get-product');
      console.log("Products data:", data);
      setProducts(data.products);
    } catch (error) {
      console.log("Error fetching products:", error);
      toast.error("Something went wrong in getting products");
    }
  };

  useEffect(() => {
    getAllProducts();
  }, []);

  return (
    <Layout title={"Dashboard - All Products"}>
      <div className="container-fluid m-3 p-3">
        <div className="row">
          <div className="col-md-3">
            <AdminMenu />
          </div>
          <div className="col-md-9">
            <h1>All Products</h1>
            <Box 
              display="flex" 
              flexWrap="wrap" 
              justifyContent="space-between" 
              gap="4"
              p="2"
              overflowX="hidden"
            >
              {products.length > 0 ? (
                products.map((p) => (
                  <Card 
                    key={p._id} 
                    width={{ base: "100%", sm: "48%", md: "31%" }} 
                    mb={4} 
                    boxShadow={'0px 4px 10px rgba(0, 0, 0, 0.1)'}
                    textAlign="center" // Center text within the Card
                  >
                    <Link to={`/dashboard/admin/products/${p.slug}`} className='product-link'>
                      <CardBody>
                        <Image
                          w='full'
                          src={`/api/v1/product/product-photo/${p._id}`}
                          objectFit='cover'
                          alt={`Image of ${p.name}`} // Alt text for accessibility
                          borderRadius="lg"
                          h={{ base: '150px', md: '250px' }}
                        />
                        <Stack mt="6" spacing="3" textAlign="center"> {/* Center text within the Stack */}
                          <Heading size="md">{p.name}</Heading>
                          <Tooltip 
                            label={p.description} 
                            aria-label={`Full description of ${p.name}`}
                            bg="whiteAlpha.900"  // Set background color to white with some transparency
                            color="black"  // Set text color to black for readability
                            boxShadow="md"  // Optional: Add a subtle shadow for depth
                            border="1px solid #e2e8f0"  // Optional: Light border to make it subtle
                            placement="top"  // Optional: Set tooltip position to top
                            hasArrow  // Optional: Add an arrow pointing to the element
                          >
                            <Text cursor="pointer">
                              {p.description.split(' ').slice(0, 5).join(' ') + (p.description.split(' ').length > 5 ? '...' : '')}
                            </Text>
                          </Tooltip>
                          <Text color="red.500" fontWeight={"600"} fontSize="3xl">
                            ${p.price}
                          </Text>
                        </Stack>
                      </CardBody>
                    </Link>
                  </Card>
                ))
              ) : (
                <Text>No products available.</Text>
              )}
            </Box>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default AllProducts;
