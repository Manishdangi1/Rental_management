import React from 'react';
import { Box, Typography, Container, Grid, Card, CardContent, CardMedia, Button } from '@mui/material';
import { Link } from 'react-router-dom';

const ProductsPage: React.FC = () => {
  // Mock data - replace with actual API call
  const products = [
    {
      id: 1,
      name: 'Sample Product 1',
      description: 'This is a sample product description',
      price: 99.99,
      image: 'https://via.placeholder.com/300x200'
    },
    {
      id: 2,
      name: 'Sample Product 2',
      description: 'Another sample product description',
      price: 149.99,
      image: 'https://via.placeholder.com/300x200'
    }
  ];

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Products
      </Typography>
      <Grid container spacing={3}>
        {products.map((product) => (
          <Grid item xs={12} sm={6} md={4} key={product.id}>
            <Card>
              <CardMedia
                component="img"
                height="200"
                image={product.image}
                alt={product.name}
              />
              <CardContent>
                <Typography gutterBottom variant="h6" component="h2">
                  {product.name}
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  {product.description}
                </Typography>
                <Typography variant="h6" color="primary" gutterBottom>
                  ${product.price}
                </Typography>
                <Button
                  component={Link}
                  to={`/products/${product.id}`}
                  variant="contained"
                  color="primary"
                  fullWidth
                >
                  View Details
                </Button>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
};

export default ProductsPage; 