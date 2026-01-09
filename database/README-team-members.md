# Adding Team Members to Database

## To add team members T1, T2, T3, T4:

1. Run the SQL script:
   ```bash
   psql -U farmsolutionss_user -d farmsolutionss_db -f insert-team-members.sql
   ```

   Or connect to your database and run:
   ```sql
   \i insert-team-members.sql
   ```

2. The team members will be inserted with:
   - Images: T1.jpg, T2.jpeg, T3.jpg, T4.jpeg
   - All team members are editable through the admin panel at `/admin/about`

3. **Note**: The image URLs in the database are set to `T1.jpg`, `T2.jpeg`, `T3.jpg`, `T4.jpeg`. 
   - These images are in `frontend/src/assets/` and are automatically mapped by the `getTeamImage()` utility
   - Admin can update images through the admin panel
   - Images will display correctly on the About page

4. Team members can be edited through the admin panel:
   - Name
   - Position
   - Qualification
   - Image (can be uploaded or changed)
