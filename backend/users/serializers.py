# users/serializers.py
from rest_framework import serializers
from .models import User
from rest_framework.authtoken.models import Token
from dj_rest_auth.serializers import LoginSerializer

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'role', 'first_name', 'last_name', 'date_joined', 'password']
        extra_kwargs = {
            'password': {'write_only': True, 'style': {'input_type': 'password'}}
        }

    def create(self, validated_data):
        # 1. 'Ambil' password dari data, jangan sertakan di pembuatan awal
        password = validated_data.pop('password', None)

        # 2. Buat instance user dengan sisa data
        instance = self.Meta.model(**validated_data)

        # 3. Set password menggunakan metode khusus yang akan melakukan hashing
        if password is not None:
            instance.set_password(password)

        # 4. Atur status staff jika rolenya admin
        if validated_data.get('role') == 'admin':
            instance.is_staff = True

        # 5. Simpan user ke database
        instance.save()
        return instance
    
class CustomTokenSerializer(serializers.ModelSerializer):
    """
    Serializer kustom untuk token yang menyertakan data pengguna.
    """
    user = UserSerializer(read_only=True)

    class Meta:
        model = Token
        fields = ('key', 'user')

class UserUpdateSerializer(serializers.ModelSerializer):
    """
    Serializer ini HANYA digunakan untuk mengedit role pengguna.
    Field lain seperti username dan password tidak bisa diubah melalui serializer ini.
    """
    class Meta:
        model = User
        fields = ['role']

class CustomLoginSerializer(LoginSerializer):
    def validate(self, attrs):
        try:
            # 1. Panggil metode validasi asli dari library
            # Ini akan mencoba mencocokkan username & password
            validated_data = super().validate(attrs)
        except serializers.ValidationError:
            # 2. Jika validasi asli gagal (karena kredensial salah),
            #    ia akan melempar ValidationError. Kita tangkap error ini.

            # 3. Ganti dengan pesan error kustom kita sendiri.
            raise serializers.ValidationError({
                'non_field_errors': [('Username atau password yang Anda masukkan salah.')]
            })

        return validated_data