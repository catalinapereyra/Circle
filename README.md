CODEAR
- hacer PULL antes de trabajar 
- fijarse que estémos en .venv 
- cuando bajamos algo nuevo, pip freeze > requirements.txt (y la otra haga  pip install -r requirements.txt)
- comentar TODO el codigo y dejarlo explicado aca 

25/03/25 - 13hs 
- instalamos base de datos, flask, sqlalchemy


SEMANA 1 - sign up 
1. models/user.py (El Menú del Restaurante 📜)
Este archivo define qué datos tiene un usuario, como si fuera el menú del restaurante. 
Aquí se establece que un usuario tiene un ID, un nombre, un correo electrónico único y una contraseña cifrada. 
Es como decir: “Un plato de pasta lleva fideos, salsa y queso. No puede faltar ninguno”.


2. database/db_connection.py (La Cocina 🍳)
Aquí se configura la conexión con la base de datos, como si fuera la cocina del restaurante. 
Este archivo se encarga de abrir y cerrar la comunicación con la base de datos, asegurándose de que todo esté 
listo para recibir pedidos. Es como tener un chef esperando las órdenes del mesero.

3. services/user_service.py (El Chef 👨‍🍳)

Aquí ocurre la magia. Este archivo recibe la solicitud de registrar un usuario y sigue el proceso adecuado:
	•	Verifica que los ingredientes sean correctos (validar que el correo no exista).
	•	Cocina la comida (cifra la contraseña para mayor seguridad).
	•	Entrega el plato listo (guarda el usuario en la base de datos).
Si algo sale mal (por ejemplo, un correo duplicado), devuelve un error como si dijera 
“Ese plato ya está en la carta”.

4. routes/user_routes.py (El Mesero 🧑‍🍽️)

Este archivo es el encargado de interactuar con los clientes (los usuarios de la app).
	•	Recibe el pedido: cuando alguien quiere registrarse, el mesero recibe la solicitud.
	•	Pasa el pedido a la cocina (llama a user_service.py para registrar al usuario).
	•	Responde al cliente: si todo está bien, confirma el registro; si hay un problema, devuelve un mensaje de error.
