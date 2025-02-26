# Use Python base image
FROM python:3.11

# Set the working directory inside the container
WORKDIR /app

# Copy project files into the container
# COPY . .

# Install dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Expose Django's default port
EXPOSE 8000

# Run migrations and start Django server
CMD ["sh", "-c", "python manage.py runserver 0.0.0.0:8000"]