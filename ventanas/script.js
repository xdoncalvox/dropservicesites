
    document.addEventListener('DOMContentLoaded', () => {
        const widthInput = document.getElementById('width');
        const heightInput = document.getElementById('height');
        const materialInput = document.getElementById('material');
        const typeInput = document.getElementById('productType');
        const calcBtn = document.getElementById('calcBtn');
        const priceDisplay = document.getElementById('finalPrice');
        const finalPriceDisplay = document.getElementById('finalPrice');
        const addItemBtn = document.getElementById('addItemBtn');
        const itemContainer = document.getElementById('itemContainer');

        const menuToggle = document.querySelector('.menu-toggle');
        const navLinks = document.getElementById('navLinks');
        const navAnchors = navLinks.querySelectorAll('a');

        // --- NUEVAS VARIABLES DE CONTACTO Y MODAL ---
        const requestQuoteBtn = document.getElementById('requestQuoteBtn');
        const contactModal = document.getElementById('contactModal');
        const closeBtn = document.querySelector('.close-btn');
        const contactForm = document.getElementById('contactForm');
        const contactEmailInput = document.getElementById('contactEmail');
        const successMessage = document.getElementById('successMessage');

        // COSTO BASE:
        // He aumentado significativamente este valor base para que
        // refleje precios realistas en Pesos Dominicanos (RD$) en lugar de Coronas.
        // Puedes ajustar este número para subir o bajar los precios generales.
        const TASA_BASE = 45; 
        

        // Almacena la plantilla del primer ítem para clonarla
        const initialItemTemplate = document.getElementById('initialItem').outerHTML;

        function formatPrice(value) {
            // Formatear moneda Peso Dominicano (RD$)
            const formatter = new Intl.NumberFormat('es-DO', {
                style: 'currency',
                currency: 'DOP',
                minimumFractionDigits: 0,
                maximumFractionDigits: 0,
            });
            return formatter.format(value);
        }

        function calculateItemPrice(itemElement) {
            const width = parseFloat(itemElement.querySelector('.item-width').value) || 0;
            const height = parseFloat(itemElement.querySelector('.item-height').value) || 0;
            const materialFactor = parseFloat(itemElement.querySelector('.item-material').value);
            const productFactor = parseFloat(itemElement.querySelector('.item-productType').value);

            if (width > 0 && height > 0) {
                let rawPrice = ((width * height * materialFactor * productFactor) / 100) * TASA_BASE;
                
                // Actualiza el subtotal de esta ventana
                itemElement.querySelector('.subtotal-value').textContent = formatPrice(rawPrice);
                return rawPrice;
            }
            
            itemElement.querySelector('.subtotal-value').textContent = formatPrice(0);
            return 0;
        }

        function calculateTotal() {
            let grandTotal = 0;
            
            // Selecciona todas las tarjetas de ventana
            const itemCards = itemContainer.querySelectorAll('.item-card');
            
            itemCards.forEach(card => {
                grandTotal += calculateItemPrice(card);
            });

            finalPriceDisplay.textContent = formatPrice(grandTotal);
        }

        // --- LÓGICA DE AGREGAR/ELIMINAR ---

        function updateRemoveButtons() {
            const items = itemContainer.querySelectorAll('.item-card');
            // Oculta el botón de eliminar si solo hay un ítem
            items.forEach(item => {
                item.querySelector('.remove-item-btn').style.display = (items.length > 1) ? 'block' : 'none';
            });
        }

        // --- FUNCIÓN DE RE-INDEXACIÓN Y RECALCULO (NUEVA) ---

        function reindexItems() {
            const itemCards = itemContainer.querySelectorAll('.item-card');
            
            itemCards.forEach((card, index) => {
                const newIndex = index + 1; // El nuevo número de ventana (1, 2, 3...)
                
                // 1. Actualiza el Título visible (Ventana 1, Ventana 2)
                card.querySelector('.item-header h3').textContent = `Ventana ${newIndex}`;
                
                // 2. Actualiza los IDs internos de la tarjeta
                card.setAttribute('data-item-id', newIndex);
                
                // 3. Actualiza el ID que usa el botón de eliminar (CRÍTICO)
                const removeButton = card.querySelector('.remove-item-btn');
                if (removeButton) {
                    removeButton.setAttribute('data-item-id', newIndex);
                }
            });
            
            // Llamadas finales
            updateRemoveButtons(); // Actualiza la visibilidad de los botones de eliminar
            calculateTotal(); // Recalcula el precio total con los ítems re-indexados
        }

        function addItem() {
            
            // Clonar la plantilla y actualizar los IDs
            let newItemHTML = initialItemTemplate

            
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = newItemHTML;
            const newItem = tempDiv.firstChild;
            

            // Resetear los inputs del nuevo ítem (para que empiece vacío)
            newItem.querySelectorAll('input').forEach(input => input.value = '');
            newItem.querySelector('.subtotal-value').textContent = formatPrice(0);

            newItem.querySelectorAll('.selected').forEach(el => el.classList.remove('selected'));

            // 4. Seleccionar la primera opción por defecto (PVC y Fija/Abatible)
            newItem.querySelector('.material-option[data-value="1.8"]').classList.add('selected');
            newItem.querySelector('.item-material').value = '1.8';
            
            newItem.querySelector('.product-option[data-value="1.0"]').classList.add('selected');
            newItem.querySelector('.item-productType').value = '1.0';
            
            // Insertar y actualizar botones
            itemContainer.appendChild(newItem);
            reindexItems();
            
            // Enfocar el primer input del nuevo ítem para UX
            newItem.querySelector('.item-width').focus();
        }
        
        function removeItem(itemId) {
            const itemToRemove = itemContainer.querySelector(`[data-item-id="${itemId}"]`);
            if (itemToRemove) {
                itemToRemove.remove();
                reindexItems();
            }
        }

        // --- FUNCIONALIDAD DEL MENÚ COLAPSABLE (Añadir este bloque) ---
        menuToggle.addEventListener('click', () => {
            navLinks.classList.toggle('active');
        });

        navAnchors.forEach(anchor => {
            anchor.addEventListener('click', () => {
                if (window.innerWidth <= 768) {
                    navLinks.classList.remove('active');
                }
            });
        });
        // -----------------------------------------------------------------

        // Listener para agregar ítem
        addItemBtn.addEventListener('click', addItem);

        // --- LÓGICA DEL SELECTOR DE IMAGEN DE MATERIAL ---

        // Listener delegado para los clics en todas las opciones de material
        itemContainer.addEventListener('click', (e) => {
            const materialOption = e.target.closest('.material-option');
            
            if (materialOption) {
                e.preventDefault();
                const currentItemCard = materialOption.closest('.item-card');
                const hiddenMaterialInput = currentItemCard.querySelector('.item-material');
                const newValue = materialOption.getAttribute('data-value');
                
                // 1. Quitar la clase 'selected' de todos los hermanos del mismo grupo
                currentItemCard.querySelectorAll('.material-option').forEach(opt => {
                    opt.classList.remove('selected');
                });

                // 2. Agregar la clase 'selected' a la opción clickeada
                materialOption.classList.add('selected');

                // 3. Actualizar el valor del input oculto (¡CRÍTICO para el cálculo!)
                if (hiddenMaterialInput.value !== newValue) {
                    hiddenMaterialInput.value = newValue;
                    // Forzar el recálculo total si el valor cambió
                    calculateTotal(); 
                }
            }
        });

        // --- NUEVA FUNCIÓN DE SERIALIZACIÓN ---
        function serializeItems() {
            const items = [];
            const itemCards = itemContainer.querySelectorAll('.item-card');
            
            // Si no hay ítems, enviamos un ítem vacío (Ventana 0) para el total
            if (itemCards.length === 0) {
                return [{
                    id: 0,
                    detalle: "No se introdujeron ventanas; cotizar proyecto completo.",
                    costo_estimado: finalPriceDisplay.textContent
                }];
            }
            
            itemCards.forEach(card => {
                const id = card.getAttribute('data-item-id');
                const title = card.querySelector('.item-header h3').textContent;
                const width = card.querySelector('.item-width').value || 'N/A';
                const height = card.querySelector('.item-height').value || 'N/A';
                
                // Obtener el nombre de la opción seleccionada (material)
                const materialElement = card.querySelector('.material-option.selected');
                const materialName = materialElement ? materialElement.querySelector('p').textContent : 'No Seleccionado';
                
                // Obtener el nombre de la opción seleccionada (tipo de sistema)
                const productElement = card.querySelector('.product-option.selected');
                const productName = productElement ? productElement.querySelector('p').textContent : 'No Seleccionado';
                
                const subtotal = card.querySelector('.subtotal-value').textContent;

                items.push({
                    id: parseInt(id),
                    ventana: title,
                    ancho: width,
                    alto: height,
                    material: materialName,
                    sistema: productName,
                    subtotal_estimado: subtotal
                });
            });
            
            // Añadimos el total estimado al final del objeto
            items.push({
                TOTAL_ESTIMADO: finalPriceDisplay.textContent
            });

            return items;
        }
        
        // --- LÓGICA DEL MODAL DE CONTACTO Y ENVÍO ---

        // 1. Abrir modal al hacer clic en el botón de solicitud
        requestQuoteBtn.addEventListener('click', () => {
            contactModal.style.display = "block";
            successMessage.style.display = 'none'; // Asegurar que el mensaje de éxito esté oculto
            contactForm.style.display = 'block';
        });

        // 2. Cerrar modal al hacer clic en la X
        closeBtn.addEventListener('click', () => {
            contactModal.style.display = "none";
        });

        // 3. Cerrar modal al hacer clic fuera del contenido
        window.addEventListener('click', (event) => {
            if (event.target == contactModal) {
                contactModal.style.display = "none";
            }
        });

        // 4. Manejar el envío del formulario de contacto
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const contactInfo = contactEmailInput.value;
            const windowData = serializeItems(); // Obtiene todos los datos serializados
            
            console.log("--- SOLICITUD DE COTIZACIÓN ENVIADA ---");
            console.log("Contacto del Cliente:", contactInfo);
            console.log("Detalles del Pedido:", windowData);
            
            // SIMULACIÓN DE ENVÍO
            // En un entorno real, aquí se usaría fetch() o XMLHttpRequest 
            // para enviar 'contactInfo' y 'windowData' a un servidor (e.g., PHP, Node.js)
            
            // Mostrar mensaje de éxito y ocultar formulario
            contactForm.style.display = 'none';
            successMessage.style.display = 'block';
            
            // Opcional: Cerrar el modal automáticamente después de 4 segundos
            setTimeout(() => {
                contactModal.style.display = "none";
            }, 4000);
        });
        // ... Tu listener de input y click en itemContainer continúa aquí ... 
        // NOTA: Asegúrate de que el listener de input anterior NO contenga lógica 
        // que intente leer el valor de un <select> en el campo de material, ya que fue eliminado.

        // --- LÓGICA DEL SELECTOR DE IMAGEN DE PRODUCTO (TIPO DE SISTEMA) ---

        // Listener delegado para los clics en todas las opciones de producto
        itemContainer.addEventListener('click', (e) => {
            const productOption = e.target.closest('.product-option');
            
            if (productOption) {
                e.preventDefault();
                const currentItemCard = productOption.closest('.item-card');
                const hiddenProductInput = currentItemCard.querySelector('.item-productType');
                const newValue = productOption.getAttribute('data-value');
                
                // 1. Quitar la clase 'selected' de todos los hermanos del mismo grupo
                currentItemCard.querySelectorAll('.product-option').forEach(opt => {
                    opt.classList.remove('selected');
                });

                // 2. Agregar la clase 'selected' a la opción clickeada
                productOption.classList.add('selected');

                // 3. Actualizar el valor del input oculto (¡CRÍTICO para el cálculo!)
                if (hiddenProductInput.value !== newValue) {
                    hiddenProductInput.value = newValue;
                    // Forzar el recálculo total si el valor cambió
                    calculateTotal(); 
                }
            }
        });

        // Listener delegado para cambios en CUALQUIER input/select y botones de eliminar
        itemContainer.addEventListener('input', (e) => {
            // Si el evento viene de un input de cotización, recalcula
            if (e.target.closest('.form-grid')) {
                calculateTotal();
            }
        });

        itemContainer.addEventListener('click', (e) => {
            // Si el click es en un botón de eliminar
            const removeButton = e.target.closest('.remove-item-btn');
            if (removeButton) {
                e.preventDefault();
                // OPTIMIZACIÓN: Obtenemos el ID directamente del botón (que ahora tiene el ID correcto)
                const itemId = removeButton.getAttribute('data-item-id'); 
                removeItem(itemId);
            }
        });

        // --- LÓGICA DEL MODAL DE CONTACTO Y ENVÍO ---

        // Patrones de expresiones regulares para validación
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        // Este patrón acepta números de teléfono con guiones, espacios, paréntesis, o solo dígitos.
        // Ejemplo: 809-555-1234, (809) 555 1234, 8095551234
        const phoneRegex = /^\+?(\d{1,4}[-.\s]?)?(\(\d{1,}\)[-.\s]?)?\d{1,}[-.\s]?\d{1,}[-.\s]?\d{1,}$/;

        // 1. Abrir modal al hacer clic en el botón de solicitud
        requestQuoteBtn.addEventListener('click', () => {
            contactModal.style.display = "block";
            successMessage.style.display = 'none'; // Asegurar que el mensaje de éxito esté oculto
            contactForm.style.display = 'block';
        });

        // 2. Cerrar modal al hacer clic en la X
        closeBtn.addEventListener('click', () => {
            contactModal.style.display = "none";
        });

        // 3. Cerrar modal al hacer clic fuera del contenido
        window.addEventListener('click', (event) => {
            if (event.target == contactModal) {
                contactModal.style.display = "none";
            }
        });

        // 4. Manejar el envío del formulario de contacto
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const contactInfo = contactEmailInput.value.trim();
            
            // 🚨 VALIDACIÓN DE FORMATO 🚨
            const isValidEmail = emailRegex.test(contactInfo);
            const isValidPhone = phoneRegex.test(contactInfo.replace(/\s/g, '')); // Quitar espacios para validar mejor el teléfono
            
            if (!isValidEmail && !isValidPhone) {
                alert("Por favor, ingrese un correo electrónico válido (ej. correo@dominio.com) o un número de teléfono (ej. 809-123-4567).");
                contactEmailInput.focus();
                return; // Detiene el envío si la validación falla
            }
            
            const windowData = serializeItems(); // Obtiene todos los datos serializados
            
            console.log("--- SOLICITUD DE COTIZACIÓN ENVIADA ---");
            console.log("Contacto del Cliente:", contactInfo);
            console.log("Detalles del Pedido:", windowData);
            
            // SIMULACIÓN DE ENVÍO
            
            // Mostrar mensaje de éxito y ocultar formulario
            contactForm.style.display = 'none';
            successMessage.style.display = 'block';
            
            // Opcional: Cerrar el modal automáticamente después de 4 segundos
            setTimeout(() => {
                contactModal.style.display = "none";
            }, 4000);
        });

        // Inicialización al cargar la página
        reindexItems();
    });


// Inicialización de Scroll Fluido
const lenis = new Lenis({
    duration: 1.2, // Mayor número = más lento y suave (1.2 es ideal para lujo)
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // Curva de aceleración suave
    direction: 'vertical',
    gestureDirection: 'vertical',
    smooth: true,
    mouseMultiplier: 1,
    smoothTouch: false, // Desactivar en móvil suele ser mejor para UX nativa
    touchMultiplier: 2,
});

// Loop de animación
function raf(time) {
    lenis.raf(time);
    requestAnimationFrame(raf);
}
requestAnimationFrame(raf);

// Conectar los links del menú (anclas) con Lenis para que también sean fluidos
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        lenis.scrollTo(this.getAttribute('href'));
    });
});
