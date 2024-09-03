import { Link, useLocation } from 'react-router-dom';
import {
  Box,
  Button,
  Checkbox,
  Flex,
  Grid,
  GridItem,
  VStack,
  Stack,
  Text,
  Radio,
  RadioGroup,
} from '@chakra-ui/react';
import NavBar from '../components/navBar';
import Drawer from '../components/Drawer';
import Footer from '../components/Footer';
import ProductCard from '../components/card';
import { useState, useEffect } from 'react';
import axios from 'axios';
import loader from '../assets/images/Loader.gif'; // Adjust the path as needed

function Shop() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [checked, setChecked] = useState([]);
  const [priceRange, setPriceRange] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [filterApplied, setFilterApplied] = useState(false); // State to manage filter application
  const [noProductsMessage, setNoProductsMessage] = useState(''); // State for no products message

  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const initialCategory = queryParams.get('category');

  useEffect(() => {
    getAllCategories();
    getTotalProducts();
  }, []); // Only run once on component mount

  useEffect(() => {
    if (initialCategory) {
      setChecked([initialCategory]);
      setFilterApplied(true); // Mark filter as applied if there's an initial category
    }
  }, [initialCategory]);

  useEffect(() => {
    if (filterApplied || (checked.length === 0 && priceRange.length === 0) ) {
      fetchProducts(); // Fetch products only if filters are applied or reset
    }
  }, [checked, priceRange, page]); // Trigger fetch on filter or page change

  const getAllCategories = async () => {
    try {
      const { data } = await axios.get('/api/v1/category/all-category');
      if (data?.success) {
        setCategories(data?.category);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const getTotalProducts = async () => {
    try {
      const { data } = await axios.get('/api/v1/product/product-count');
      setTotal(data?.total);
    } catch (error) {
      console.log(error);
    }
  };

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const requestBody = {
        checked: checked.length > 0 ? checked : null,  // Ensure proper request payload for filters
        radio: priceRange.length > 0 ? priceRange : null,
        page,
      };
      const { data } = await axios.post('/api/v1/product/product-filters', requestBody);
      if (data?.products.length === 0) {
        const categoryName = categories.find(c => c._id === checked[0])?.name;
        setNoProductsMessage(`Sorry, no products available for ${categoryName}`);
      } else {
        setProducts(data?.products || []);
        setNoProductsMessage(''); // Clear message if products are available
      }
      setLoading(false);
    } catch (error) {
      console.log(error);
      setLoading(false);
      setProducts([]);
      setNoProductsMessage('An error occurred while fetching products.');
    }
  };

  const handleCategoryFilter = (value, id) => {
    let all = [...checked];
    if (value) {
      all.push(id);
    } else {
      all = all.filter((c) => c !== id);
    }
    setChecked(all);
    setFilterApplied(true); // Indicate that a filter is applied
  };

  const handlePriceChange = (value) => {
    const range = value.split(',').map(Number);
    setPriceRange(range);
    setFilterApplied(true); // Indicate that a filter is applied
  };

  const resetFilters = () => {
    setChecked([]);
    setPriceRange([]);
    setPage(1);
    setFilterApplied(false); // Reset filter applied state
    setNoProductsMessage(''); // Clear no products message on reset
   
  };

  return (
    <>
      <NavBar />
      <Box>
        <Grid templateColumns='repeat(9, 1fr)' gap={0} mt={8} mb={8}>
          <GridItem
            colSpan={{ base: '9', md: '4', lg: '2' }}
            p={5}
            border='1px solid #e8e8e8'
            rounded={10}
            bg='white'
            boxShadow='md'
            position='sticky'
            top={0}
            zIndex={10}
          >
            <Flex direction='column'>
              <Flex justify='space-between' align='center' mb={0}>
                <Text fontWeight='600' fontSize='3xl'>Filters</Text>
                <Box display={{ base: 'none', md: 'none', lg: 'block' }}>
                  <i className="fa-regular fa-sliders text-xl mt-1 cursor-pointer"></i>
                </Box>
                <Box display={{ base: 'block', md: 'block', lg: 'none' }}>
                  <Drawer />
                </Box>
              </Flex>

              <Flex flexDir='column' display={{base:"none", md:"none", lg:'flex'}} gap={0}>
                <Text mb={3} fontWeight='600' fontSize='18px'>Categories</Text>
                <VStack h={'fit-content'} mt={3} justify={"flex-start"} align={"flex-start"} spacing={'1px'}>
                  {categories.map((c) => (
                    <Checkbox
                      key={c._id}
                      spacing={2}
                      flex={"flex"}
                      alignItems={"center"}
                      justifyContent={"center"}
                      mt={-5}
                      onChange={(e) => handleCategoryFilter(e.target.checked, c._id)}
                      colorScheme="red"
                      isChecked={checked.includes(c._id)}
                    >
                      <Text mt={"12px"} fontWeight='400'>{c.name}</Text>
                    </Checkbox>
                  ))}
                </VStack>

                <Text fontWeight='600' fontSize='3xl'>Price</Text>
                <RadioGroup mt={-4} onChange={handlePriceChange} value={priceRange.join(',')}>
                  <Stack spacing={4}>
                    <Radio value="0,20">Up to $20</Radio>
                    <Radio value="21,50">$21 - $50</Radio>
                    <Radio value="51,100">$51 - $100</Radio>
                    <Radio value="101,200">$101 - $200</Radio>
                    <Radio value="201,Infinity">Above $200</Radio>
                  </Stack>
                </RadioGroup>

                <Button mt={6} colorScheme="red" onClick={fetchProducts} >
                  Apply Filters
                </Button>
                <Button mt={2} colorScheme="gray" onClick={resetFilters} >
                  <Link>Reset Filters</Link>
                </Button>
              </Flex>
            </Flex>
          </GridItem>

          <GridItem p={{base:12}} colSpan={{ base: '10', md: '5', lg: '7' }}>
            <Box>
              <Text mb={4} fontWeight='700' fontSize='3xl'>Top Trending</Text>
            </Box>
            {loading ? (
              <Flex justify="center" align="center" height="80vh">
                <Box>
                  <img
                    src={loader}
                    alt="Loading..."
                    style={{ width: '50px', height: '50px' }} // Adjust the size as needed
                  />
                </Box>
              </Flex>
            ) : noProductsMessage ? (
              <Flex justify="center" align="center" height="80vh">
                <Text fontSize="xl" color="red.500">{noProductsMessage}</Text>
              </Flex>
            ) : (
              <Flex gap={10} flexWrap='wrap'>
                {products.map((product) => (
                  <ProductCard key={product._id} product={product} />
                ))}
              </Flex>
            )}
          </GridItem>
        </Grid>
      </Box>
      <Footer />
    </>
  );
}

export default Shop;