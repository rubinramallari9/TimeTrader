import django.db.models.deletion
import uuid
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('repairs', '0002_add_repair_showcase'),
    ]

    operations = [
        migrations.CreateModel(
            name='RepairPromotion',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('plan', models.CharField(
                    choices=[('1m', '1 Month'), ('3m', '3 Months'), ('6m', '6 Months')],
                    max_length=20,
                )),
                ('started_at', models.DateTimeField(auto_now_add=True)),
                ('expires_at', models.DateTimeField()),
                ('is_active', models.BooleanField(default=True)),
                ('shop', models.OneToOneField(
                    on_delete=django.db.models.deletion.CASCADE,
                    related_name='promotion',
                    to='repairs.repairshop',
                )),
            ],
            options={
                'db_table': 'repair_promotions',
            },
        ),
    ]
