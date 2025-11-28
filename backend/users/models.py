from django.db import models
from django.contrib.auth.models import AbstractUser

class User(AbstractUser):
    """
    Model pengguna kustom untuk membedakan peran Admin dan Kasir.
    """
    class Role(models.TextChoices):
        ADMIN = 'admin', 'Admin'
        KASIR = 'kasir', 'Kasir'

    # Menambahkan field 'role' dengan pilihan dan nilai default
    role = models.CharField(
        max_length=10, 
        choices=Role.choices, 
        default=Role.KASIR,
        help_text="Peran pengguna dalam sistem"
    )

    def __str__(self):
        return self.username