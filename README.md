# TP Base de Datos II

## Integrantes

* Justina Vacas Castro
* Josefina Assaff
* Ian Mejalelaty

## Enunciado

El objetivo del TP es realizar una API que para cada usuario guarde URLs y luego acortarlas, como Bitly.

## Setup

Crear el archivo .env y colocar el sigiente contenido:

        DATABASE_URL= URL de la base de datos de monogodb
        ACCES_TOKEN_SECRET= string a eleccion
        SUPPRESS_NO_CONFIG_WARNING= boolean (true)
        REDIS_URL=redis://localhost:6379

Luego ejecutar:

```npm install```
    
Y por ultimo:

```npm start```