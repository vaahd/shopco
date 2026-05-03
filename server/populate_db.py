import os
import django
import sys

# Set up Django environment
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from shop.models import Category, Product, ProductSize, ProductColor

# Product Data to Populate
products_data = [
    {
        "id": "p1",
        "name": "T-shirt with Tape Details",
        "brand": "ZARA",
        "price": 120.00,
        "rating": 4.5,
        "reviewCount": 120,
        "image": "products/tshirt-tape.png",
        "category": "Casual",
        "sizes": ["S", "M", "L", "XL", "XXL"],
        "colors": [{"name": "Black", "hex": "#000000","image": "tshirt-tape.png"}, {"name": "White", "hex": "#FFFFFF","image": "tshirt-tape-white.png"}, {"name": "Navy", "hex": "#000080","image": "tshirt-tape-navy.png"}],
        "isNew": True,
    },
    {
        "id": "p2",
        "name": "Checkered Shirt",
        "brand": "ZARA",
        "price": 180.00,
        "rating": 4.5,
        "reviewCount": 95,
        "image": "products/shirt-check.jpg",
        "category": "Formal",
        "sizes": ["S", "M", "L", "XL"],
        "colors": [{"name": "Red/Black", "hex": "#8B0000","image": "shirt-check.jpg"}, {"name": "Blue/White", "hex": "#ADD8E6","image": "shirt-check-blue.png"}],
    },
    {
        "id": "p3",
        "name": "Sleeve Striped T-shirt",
        "brand": "GUCCI",
        "price": 130.00,
        "originalPrice": 160.00,
        "rating": 4.5,
        "reviewCount": 150,
        "image": "products/tshirt-striped.png",
        "category": "Casual",
        "sizes": ["S", "M", "L", "XL"],
        "colors": [{"name": "Black/White", "hex": "#000000","image": "tshirt-striped.png"}, {"name": "Grey/Black", "hex": "#808080","image": "tshirt-striped-grey.png"}],
        "discount": 19,
    },
    {
        "id": "p4",
        "name": "Vertical Striped Shirt",
        "brand": "PRADA",
        "price": 212.00,
        "originalPrice": 232.00,
        "rating": 5.0,
        "reviewCount": 200,
        "image": "products/shirt-vertical.png",
        "category": "Formal",
        "sizes": ["S", "M", "L", "XL"],
        "colors": [{"name": "Blue/White", "hex": "#0000FF","image": "shirt-vertical.png"}, {"name": "Grey/White", "hex": "#D3D3D3","image": "shirt-vertical-grey.png"}],
        "discount": 8,
    },
    {
        "id": "p5",
        "name": "Courage Graphic T-shirt",
        "brand": "Calvin Klein",
        "price": 145.00,
        "rating": 4.0,
        "reviewCount": 80,
        "image": "products/tshirt-courage.png",
        "category": "Casual",
        "sizes": ["S", "M", "L", "XL"],
        "colors": [{"name": "Black", "hex": "#000000","image": "tshirt-courage.png"}, {"name": "Orange", "hex": "#FFA500","image": "tshirt-courage-orange.png"}],
        "isNew": True,
    },
    {
        "id": "p6",
        "name": "Loose Fit Bermuda Shorts",
        "brand": "ZARA",
        "price": 80.00,
        "rating": 4.5,
        "reviewCount": 65,
        "image": "products/shorts-beige.jpg",
        "category": "Casual",
        "sizes": ["30", "32", "34", "36"],
        "colors": [{"name": "Beige", "hex": "#F5F5DC","image": "shorts-beige.jpg"}],
    },
    {
        "id": "p7",
        "name": "Faded Skinny Jeans",
        "brand": "Calvin Klein",
        "price": 210.00,
        "originalPrice": 300.00,
        "rating": 4.5,
        "reviewCount": 180,
        "image": "products/jeans-blue.jpg",
        "category": "Casual",
        "sizes": ["30", "32", "34", "36"],
        "colors": [{"name": "Blue", "hex": "#0000FF","image": "jeans-blue.jpg"}],
        "discount": 30,
    },
    {
        "id": "p13",
        "name": "Light Blue Linen Shirt",
        "brand": "PRADA",
        "price": 190.00,
        "rating": 4.9,
        "reviewCount": 42,
        "image": "products/shirt-linen-blue.png",
        "category": "Formal",
        "sizes": ["S", "M", "L", "XL"],
        "colors": [{"name": "Light Blue", "hex": "#ADD8E6","image": "shirt-linen-blue.png"}],
        "isNew": True,
    },
    {
        "id": "p14",
        "name": "Navy Blue Cargo Pants",
        "brand": "ZARA",
        "price": 140.00,
        "rating": 4.7,
        "reviewCount": 68,
        "image": "products/pants-cargo-navy.png",
        "category": "Casual",
        "sizes": ["30", "32", "34", "36"],
        "colors": [{"name": "Navy", "hex": "#000080","image": "pants-cargo-navy.png"}],
    },
    {
        "id": "p15",
        "name": "Insulated Puffer Vest",
        "brand": "Calvin Klein",
        "price": 165.00,
        "rating": 4.6,
        "reviewCount": 25,
        "image": "products/vest-puffer-black.png",
        "category": "Activewear",
        "sizes": ["S", "M", "L", "XL"],
        "colors": [{"name": "Black", "hex": "#000000","image": "vest-puffer-black.png"}],
        "isNew": True,
    },
    {
        "id": "p17",
        "name": "Midnight Party Blazer",
        "brand": "PRADA",
        "price": 280.00,
        "rating": 5.0,
        "reviewCount": 15,
        "image": "products/blazer-midnight.png",
        "category": "Party",
        "sizes": ["48", "50", "52", "54"],
        "colors": [{"name": "Midnight Blue", "hex": "#191970","image": "blazer-midnight.png" }],
        "isNew": True,
    }
]

def populate():
    print("Populating database...")
    for p in products_data:
        category, _ = Category.objects.get_or_create(name=p['category'], slug=p['category'].lower())
        
        product = Product.objects.create(
            name=p['name'],
            brand=p['brand'],
            price=p['price'],
            original_price=p.get('originalPrice'),
            rating=p['rating'],
            review_count=p['reviewCount'],
            image=f"products/{p['image'].split('/')[-1]}",
            category=category,
            description=f"Experience high-end style with this {p['name']} by {p['brand']}.",
            is_new=p.get('isNew', False),
            discount=p.get('discount')
                
        )
        
        for size in p['sizes']:
            import random
            ProductSize.objects.create(product=product, size=size, stock=random.randint(5, 50))
        for color in p['colors']:
            ProductColor.objects.create(product=product, name=color['name'], hex_code=color['hex'] ,image=f"products/{color['image']}" if 'image' in color else None)
            print(f"Added product: {p['name']}")

if __name__ == '__main__':
    populate()
