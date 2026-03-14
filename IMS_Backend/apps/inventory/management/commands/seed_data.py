import random
from datetime import timedelta
from django.core.management.base import BaseCommand
from django.utils import timezone
from django.contrib.auth import get_user_model
from apps.products.models import Product, Category, UnitOfMeasure
from apps.inventory.models import Supplier, Receipt, ReceiptLine
from apps.warehouses.models import Warehouse, Location, StockRecord

User = get_user_model()

class Command(BaseCommand):
    help = 'Seeds the database with dummy inventory data'

    def handle(self, *args, **options):
        self.stdout.write('Seeding data...')

        # 1. Get or create a superuser/admin for 'created_by' fields
        admin_user = User.objects.filter(role='admin').first()
        if not admin_user:
            admin_user = User.objects.create_superuser(
                email='admin@odoo.com',
                password='adminpassword',
                first_name='Admin',
                last_name='User'
            )
            admin_user.role = 'admin'
            admin_user.save()

        # 2. Units of Measure
        uoms = [('pcs', 'pc'), ('kg', 'kg'), ('box', 'bx'), ('unit', 'un')]
        uom_objs = []
        for name, abbr in uoms:
            uom, _ = UnitOfMeasure.objects.get_or_create(name=name, defaults={'abbreviation': abbr})
            uom_objs.append(uom)

        # 3. Categories
        categories = ['Electronics', 'Furniture', 'Stationery', 'Hardware']
        cat_objs = []
        for cat_name in categories:
            cat, _ = Category.objects.get_or_create(name=cat_name)
            cat_objs.append(cat)

        # 4. Suppliers
        suppliers = [
            ('Tech Solutions Inc', 'SUP-TECH', 'sales@techsolutions.com', '1234567890', 'Silicon Valley, CA'),
            ('Global Furniture Ltd', 'SUP-GLOB', 'info@globalfurniture.com', '0987654321', 'London, UK'),
            ('Office Mart', 'SUP-OFFI', 'orders@officemart.com', '1122334455', 'New York, NY'),
        ]
        sup_objs = []
        for name, code, email, phone, addr in suppliers:
            sup, _ = Supplier.objects.get_or_create(
                code=code,
                defaults={'name': name, 'email': email, 'phone': phone, 'address': addr}
            )
            sup_objs.append(sup)

        # 5. Warehouses & Locations
        warehouses = [
            ('Main Warehouse', 'MWH', '123 Main St, Mumbai'),
            ('Secondary Hub', 'SHUB', '456 Hub Rd, Delhi'),
        ]
        loc_objs = []
        for name, code, addr in warehouses:
            wh, _ = Warehouse.objects.get_or_create(
                code=code,
                defaults={'name': name, 'address': addr}
            )
            # Create a default 'Stock' location for each warehouse
            loc, _ = Location.objects.get_or_create(
                warehouse=wh,
                code='STOCK',
                defaults={'name': 'Stock Area', 'location_type': Location.LocationType.SHELF}
            )
            loc_objs.append(loc)

        # 6. Products
        products_data = [
            ('Laptop Pro 15', 'LAP-001', 'Electronics', 'High performance laptop', 'pcs'),
            ('Wireless Mouse', 'MOU-002', 'Electronics', 'Ergonomic mouse', 'pcs'),
            ('Office Desk', 'DSK-003', 'Furniture', 'Sturdy wooden desk', 'pcs'),
            ('Ergonomic Chair', 'CHR-004', 'Furniture', 'Comfortable chair', 'pcs'),
            ('A4 Paper Bundle', 'PAP-005', 'Stationery', '500 sheets bundle', 'box'),
            ('Steel Hammer', 'HAM-006', 'Hardware', 'Durable hammer', 'pcs'),
        ]
        prod_objs = []
        for name, sku, cat_name, desc, uom_name in products_data:
            cat = Category.objects.get(name=cat_name)
            uom = UnitOfMeasure.objects.get(name=uom_name)
            prod, created = Product.objects.get_or_create(
                sku=sku,
                defaults={
                    'name': name,
                    'category': cat,
                    'description': desc,
                    'unit_of_measure': uom,
                    'min_stock_level': 5,
                    'created_by': admin_user
                }
            )
            prod_objs.append(prod)

        # 7. Receipts (Initial Stock)
        if not Receipt.objects.exists():
            for i in range(3):
                supplier = random.choice(sup_objs)
                dest_loc = random.choice(loc_objs)
                receipt = Receipt.objects.create(
                    supplier=supplier,
                    destination_location=dest_loc,
                    scheduled_date=timezone.now() + timedelta(days=i),
                    status='validated',
                    created_by=admin_user,
                    validated_by=admin_user,
                    validated_at=timezone.now(),
                    notes='Initial seeding of inventory.'
                )
                
                # Add 3-4 products to each receipt
                sampled_prods = random.sample(prod_objs, k=3)
                for prod in sampled_prods:
                    qty = random.randint(10, 50)
                    ReceiptLine.objects.create(
                        receipt=receipt,
                        product=prod,
                        quantity=qty
                    )
                    
                    # Manual stock update since signal might not be enough or we want to be sure
                    sr, created = StockRecord.objects.get_or_create(
                        product=prod,
                        location=dest_loc,
                        defaults={'quantity': 0}
                    )
                    sr.quantity += qty
                    sr.save()

        self.stdout.write(self.style.SUCCESS('Successfully seeded dummy data!'))
