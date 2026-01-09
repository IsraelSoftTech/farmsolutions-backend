# Adding Products to Database

## To add pro1, pro2, pro3 products

1. Run the SQL script:

   ```bash
   psql -U farmsolutionss_user -d farmsolutionss_db -f insert-products.sql
   ```

   Or connect to your database and run:

   ```sql
   \i insert-products.sql
   ```

2. The products will be inserted with:

   - Product IDs: pro1, pro2, pro3
   - Images: pro1.jpeg, pro2.jpeg, pro3.jpeg
   - All products are editable through the admin panel

3. **Note**: The image URLs in the database are set to `pro1.jpeg`, `pro2.jpeg`, `pro3.jpeg`.

   - These images should be uploaded through the admin panel or placed in the public/uploads folder
   - Admin can update images through the admin panel at `/admin/products`

4. The images (pro1.jpeg, pro2.jpeg, pro3.jpeg) are currently in `frontend/src/assets/` and can be:
   - Uploaded through the admin panel
   - Or copied to the public folder for direct access
