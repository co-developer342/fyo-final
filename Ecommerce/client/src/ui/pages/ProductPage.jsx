import { useEffect, useState } from 'react';
import { Button, Flex, HStack, Img, Text, Icon, Select, Box, GridItem, Grid } from '@chakra-ui/react';
import { ArrowBackIcon } from '@chakra-ui/icons';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { useToast } from '@chakra-ui/react';
import axios from 'axios';
import NavBar from '../components/navBar';
import Footer from '../components/Footer';
import { useCart } from '../../context/cart';
import ProductCard from '../components/card';
import loader from '../assets/images/Loader.gif'; // Adjust the path as needed

function ProductPage() {
  const params = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const [product, setProduct] = useState(null);
  const [selectedAttributes, setSelectedAttributes] = useState({});
  const [cart, setCart] = useCart();
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(false);

  const getSimilarProduct = async (pid, cid) => {
    try {
      setLoading(true);
      const { data } = await axios.get(`/api/v1/product/related-product/${pid}/${cid}`);
      setRelatedProducts(data?.products);
      setLoading(false);
    } catch (error) {
      console.log(error);
      setLoading(false);
    }
  };

  const getProduct = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(`/api/v1/product/get-product/${params.slug}`);
      setProduct(data?.product);

      // Set default attributes
      const defaultAttributes = {};
      data?.product.attributes.forEach(attr => {
        if (attr.values.length > 0) {
          defaultAttributes[attr.key] = {
            value: attr.values[0].value,
            price: attr.values[0].price
          };
        }
      });
      setSelectedAttributes(defaultAttributes);

      getSimilarProduct(data?.product._id, data?.product.category._id);
    } catch (error) {
      console.log(error);
      setLoading(false);
    }
  };

  const handleAttributeChange = (key, value, price) => {
    setSelectedAttributes({
      ...selectedAttributes,
      [key]: { value, price }
    });

    // Show a toast notification when an attribute is selected
    toast({
      title: 'Attribute Selected',
      description: `${key}: ${value} selected with additional price of ${price.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}`,
      status: 'info',
      duration: 2000,
      isClosable: true,
      position: 'top-right',
    });
  };

  const calculatePrice = () => {
    if (!product) return 0;
    let totalPrice = product.price;
    Object.values(selectedAttributes).forEach(attr => {
      totalPrice += attr.price;
    });
    return totalPrice;
  };

  const onAddToCart = () => {
    if (product) {
      const productIndex = cart.findIndex(
        (item) =>
          item._id === product._id &&
          JSON.stringify(item.selectedAttributes) === JSON.stringify(selectedAttributes)
      );
  
      if (productIndex >= 0) {
        // If the product with the same attributes already exists in the cart, increase the quantity
        const updatedCart = [...cart];
        updatedCart[productIndex].quantity += 1;
        setCart(updatedCart);
        localStorage.setItem('cart', JSON.stringify(updatedCart));
        toast({
          title: 'Product Quantity Updated',
          description: "The quantity of the product in your cart has been increased",
          status: 'success',
          duration: 2000,
          isClosable: true,
          position: 'top-right',
        });
      } else {
        // If the product with the same attributes does not exist, add it to the cart
        const updatedCart = [...cart, { ...product, selectedAttributes, quantity: 1 }];
        setCart(updatedCart);
        localStorage.setItem('cart', JSON.stringify(updatedCart));
        toast({
          title: 'Product Added to Cart',
          description: "You've successfully added the product to your cart",
          status: 'success',
          duration: 2000,
          isClosable: true,
          position: 'top-right',
        });
      }
    }
  };
  
  

  useEffect(() => {
    if (params?.slug) {
      getProduct();
      window.scrollTo(0, 0);
    }
  }, [params?.slug]);

  if (loading) {
    return (
      <Flex justify="center" align="center" height="100vh">
        <Box>
          <Img
            src={loader}
            alt="Loading..."
            width="50px"
            height="50px"
          />
        </Box>
      </Flex>
    );
  }

  if (!product) {
    return <Text>Loading...</Text>;
  }

  return (
    <>
      <NavBar />
      <Flex justify={'center'} h={'100%'} alignItems={'flex-center'} flexDir={'column'} my={{ base: '6rem', md: '1rem' }}>
        <Flex
          mx={{ base: '30px', md: '60px' }}
          justify={'center'}
          rounded={20}
          mb={3}
          p={10}
          gap={20}
          boxShadow={'10px 10px 20px rgba(0, 0, 0, 0.1)'}
          flexWrap={'wrap'}
        >
          <Img
            src={`/api/v1/product/product-photo/${product._id}`}
            alt={product.name}
            objectFit='contain'
            maxW={{ base: '100%', md: '400px' }}
            maxH={{ base: '300px', md: '400px' }}
          />
          <Flex flexDir={'column'} justify={'center'} gap={2}>
            <Link to="/">
              <HStack>
                <Icon as={ArrowBackIcon} />
                <Text _hover={{ color: 'green' }}>Home</Text>
              </HStack>
            </Link>
            <Text fontWeight={'700'} fontSize={'40px'} textTransform={'uppercase'}>
              {product.name}
            </Text>
            <Text fontWeight={'500'} fontSize={'25px'} color={'green'}>
              {calculatePrice().toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
            </Text>
            <Text textAlign={'left'} >
              <strong>Category: </strong> {product.category.name}
            </Text>
            {product.attributes.map((attr, index) => (
              <HStack key={index} spacing={2} mt={1} alignItems="center" w="100%">
                <Text fontWeight={'bold'} minW={'100px'}>{attr.key}:</Text>
                <Select
                  w={'180px'}
                  value={selectedAttributes[attr.key]?.value || ''}
                  placeholder={`Select ${attr.key}`}
                  onChange={(e) => {
                    const selectedOption = attr.values.find(value => value.value === e.target.value);
                    if (selectedOption) {
                      handleAttributeChange(attr.key, selectedOption.value, selectedOption.price);
                    }
                  }}
                >
                  {attr.values.map((value, idx) => (
                    <option key={idx} value={value.value}>
                      {value.value} (+{value.price.toLocaleString('en-US', { style: 'currency', currency: 'USD' })})
                    </option>
                  ))}
                </Select>
              </HStack>
            ))}

            <HStack mt={4}>
              <Button mt={5} colorScheme="red" onClick={onAddToCart}>
                Add to Cart
              </Button>
              {/* <Button variant="ghost" mt={5} colorScheme="red" >
                Buy Now
              </Button> */}
            </HStack>
          </Flex>
        </Flex>
        <Flex
          mx={{ base: '30px', md: '60px' }}
          justify={'start'}
          rounded={20}
          p={10}
          mb={3}
          boxShadow={'10px 10px 20px rgba(0, 0, 0, 0.1)'}
          flexWrap={'wrap'}
        >
          <Text fontWeight={'700'} fontSize={'25px'} mb={2}>
            Description:
          </Text>
          <Text fontWeight={'400'} fontSize={'15px'}>
            {product.description}
          </Text>
        </Flex>
        <Grid>
          <GridItem p={{base:12}} colSpan={{ base: '10', md: '5', lg: '7' }}>
            <Box>
              <Text mb={4} fontWeight='700' fontSize='3xl'>Similar Products</Text>
            </Box>
            <Flex gap={10} flexWrap='wrap'>
              {loading ? (
                <Text>Loading...</Text>
              ) : (
                relatedProducts.map((product) => (
                  <ProductCard key={product._id} product={product} selectedAttributes={selectedAttributes} />
                ))
              )}
            </Flex>
          </GridItem>
        </Grid>
      </Flex>
      <Footer />
    </>
  );
}

export default ProductPage;
