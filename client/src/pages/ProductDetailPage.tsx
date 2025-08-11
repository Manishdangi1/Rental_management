import React from 'react';
import { useParams } from 'react-router-dom';
import { Box, Typography, Container, Grid, Card, CardContent, CardMedia, Button } from '@mui/material';

const ProductDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  // Mock data - replace with actual API call
  const product = {
    id: parseInt(id || '1'),
    name: 'Sample Product',
    description: 'This is a detailed description of the sample product. It includes all the important information that customers need to know before making a purchase decision.',
    price: 99.99,
    image: 'https://via.placeholder.com/400x300',
    features: [
      'High quality materials',
      'Durable construction',
      'Easy to use',
      'Great value for money'
    ]
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Grid container spacing={4}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardMedia
              component="img"
              height="400"
              image={product.image}
              alt={product.name}
            />
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <Typography variant="h4" component="h1" gutterBottom>
            {product.name}
          </Typography>
          <Typography variant="h5" color="primary" gutterBottom>
            ${product.price}
          </Typography>
          <Typography variant="body1" paragraph>
            {product.description}
          </Typography>
          
          <Typography variant="h6" gutterBottom>
            Features:
          </Typography>
          <Box component="ul" sx={{ pl: 2 }}>
            {product.features.map((feature, index) => (
              <Typography key={index} component="li" variant="body1" paragraph>
                {feature}
              </Typography>
            ))}
          </Box>
          
          <Button
            variant="contained"
            color="primary"
            size="large"
            sx={{ mt: 2 }}
          >
            Add to Cart
          </Button>
        </Grid>
      </Grid>
    </Container>
  );
};

export default ProductDetailPage; 