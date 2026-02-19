# Spec — PanelKit Calc

## Problema
Calcular materiales de panel sándwich suele hacerse a ojo. Se necesita una estimación rápida y consistente para preparar ofertas y pedidos.

## Alcance v1
- Entrada: largo y ancho de cubierta (m), tipo de panel (ancho útil), largo de panel estándar.
- Solape/merma configurable (%).
- Salida: número de paneles, metros lineales de remate (perímetro), tornillos estimados.
- Validaciones básicas y mensajes claros.

## Fórmulas v1
- Área = largo * ancho
- Paneles = ceil((ancho / ancho_util) * (largo / largo_panel))
- Remates ≈ perímetro = 2*(largo+ancho)
- Tornillos = paneles * tornillos_por_panel (configurable, default 12)
- Merma = paneles * (1 + merma%)

## UI
- Formulario simple con 6 inputs.
- Botón “Calcular”.
- Tarjetas de resultado con unidades.

## Fuera de alcance (v1)
- Exportación PDF
- Presets por fabricante
- Historial de cálculos
