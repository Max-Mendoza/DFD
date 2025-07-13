from datetime import timezone
from rest_framework import serializers
from typing import Dict, List, Any

class TableSerializer(serializers.ModelSerializer):
    name = serializers.CharField()
    description = serializers.CharField()
    columns = serializers.ListField(child = serializers.CharField())
    types = serializers.ListField(child = serializers.CharField())
    values= serializers.DictField()
    def create (self, validated_data):
        user = self.context["request"].user
        project = self.context.get('project')
        table_data = validated_data.copy()
        table_data['user'] = user.id
        table_data['proyectID'] = project.id 
        table_data['created_at'] = timezone.now()
        return table_data



class DataCleanerInputSerializer(serializers.Serializer):
    """
    Serializer para validar la entrada de datos a limpiar
    """
    name = serializers.CharField(max_length=255, required=True, help_text="Nombre del dataset")
    description = serializers.CharField(max_length=1000, required=True, help_text="Descripción del dataset")
    columns = serializers.ListField(
        child=serializers.CharField(max_length=100),
        min_length=1,
        help_text="Lista de nombres de columnas"
    )
    types = serializers.ListField(
        child=serializers.ChoiceField(choices=[
            'string', 'number', 'date', 'email', 'phone', 'boolean'
        ]),
        min_length=1,
        help_text="Lista de tipos de datos para cada columna"
    )
    values = serializers.DictField(
        child=serializers.ListField(child=serializers.CharField(allow_blank=True, allow_null=True)),
        help_text="Diccionario con los valores de cada columna"
    )

    def validate(self, attrs):
        """
        Validación adicional para asegurar consistencia entre campos
        """
        columns = attrs.get('columns', [])
        types = attrs.get('types', [])
        values = attrs.get('values', {})

        # Verificar que columns y types tengan la misma longitud
        if len(columns) != len(types):
            raise serializers.ValidationError(
                "La cantidad de columnas debe coincidir con la cantidad de tipos"
            )

        # Verificar que todas las columnas estén en values
        for column in columns:
            if column not in values:
                raise serializers.ValidationError(
                    f"La columna '{column}' no se encuentra en values"
                )

        # Verificar que todas las columnas tengan la misma cantidad de valores
        value_lengths = [len(values[col]) for col in columns]
        if len(set(value_lengths)) > 1:
            raise serializers.ValidationError(
                "Todas las columnas deben tener la misma cantidad de valores"
            )

        return attrs


class CleaningReportSerializer(serializers.Serializer):
    """
    Serializer para el reporte de limpieza
    """
    total_columns = serializers.IntegerField()
    total_rows = serializers.IntegerField()
    columns_renamed = serializers.ListField(
        child=serializers.DictField(child=serializers.CharField())
    )
    values_cleaned = serializers.IntegerField()
    null_values_introduced = serializers.IntegerField()


class DataCleanerOutputSerializer(serializers.Serializer):
    """
    Serializer para la respuesta de datos limpios
    """
    status = serializers.CharField()
    message = serializers.CharField()
    data = DataCleanerInputSerializer()
    cleaning_report = CleaningReportSerializer()



    
        
        