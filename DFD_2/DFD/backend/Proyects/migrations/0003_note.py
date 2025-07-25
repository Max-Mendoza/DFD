# Generated by Django 5.2.3 on 2025-06-16 10:14

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('Proyects', '0002_alter_proyect_progress'),
    ]

    operations = [
        migrations.CreateModel(
            name='Note',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('title', models.CharField(max_length=50)),
                ('text', models.TextField()),
                ('date', models.DateField(auto_now_add=True)),
                ('proyect', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='notes', to='Proyects.proyect')),
            ],
        ),
    ]
