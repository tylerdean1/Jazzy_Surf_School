-- Master seed for all CMS-backed strings (public site + admin UI).
-- Designed to be pasted directly into Supabase SQL editor.
-- Upserts by page_key and sets EN + ES published values with approved=true.

-- =========================
-- Public UI strings (nav/team/contact/booking)
-- =========================
insert into public.cms_page_content (page_key, body_en, body_es_draft, body_es_published, approved, sort, category)
values
  -- Navigation / global
  ('nav.brandName', 'Sunset Surf Academy', 'Sunset Surf Academy', 'Sunset Surf Academy', true, 10, 'ui'),
  ('nav.loading', 'Loading…', 'Cargando…', 'Cargando…', true, 11, 'ui'),
  ('nav.logoAlt', 'Sunset Surf Academy logo', 'Logo de Sunset Surf Academy', 'Logo de Sunset Surf Academy', true, 12, 'ui'),
  ('nav.aria.openDrawer', 'open navigation', 'abrir navegación', 'abrir navegación', true, 13, 'ui'),

  ('nav.home', 'Home', 'Inicio', 'Inicio', true, 20, 'ui'),
  ('nav.lessons', 'Lessons', 'Lecciones', 'Lecciones', true, 21, 'ui'),
  ('nav.schedule', 'Book Now', 'Reservar', 'Reservar', true, 22, 'ui'),
  ('nav.gallery', 'Gallery', 'Galería', 'Galería', true, 23, 'ui'),
  ('nav.about', 'About', 'Acerca de', 'Acerca de', true, 24, 'ui'),
  ('nav.faq', 'FAQ', 'Preguntas', 'Preguntas', true, 25, 'ui'),
  ('nav.contact', 'Contact', 'Contacto', 'Contacto', true, 26, 'ui'),

  -- Team page
  ('team.title', 'Meet the Team', 'Conoce al equipo', 'Conoce al equipo', true, 10, 'ui'),
  ('team.subtitle', 'Learn from some of the best surfers in the world.', 'Aprende con algunos de los mejores surfistas del mundo.', 'Aprende con algunos de los mejores surfistas del mundo.', true, 11, 'ui'),
  ('team.intro', 'These are our top coaches who will take you to the next level in your surfing. Click on their profiles to learn a little about them!', 'Estos son nuestros mejores entrenadores que te llevarán al siguiente nivel en tu surf. Haz clic en sus perfiles para conocer un poco más sobre ellos.', 'Estos son nuestros mejores entrenadores que te llevarán al siguiente nivel en tu surf. Haz clic en sus perfiles para conocer un poco más sobre ellos.', true, 12, 'ui'),
  ('team.moreDetailsTitle', 'More team details', 'Más detalles del equipo', 'Más detalles del equipo', true, 20, 'ui'),
  ('team.moreDetailsBody', 'More team details, bios, and highlights are coming soon.', 'Pronto habrá más detalles del equipo, biografías y destacados.', 'Pronto habrá más detalles del equipo, biografías y destacados.', true, 21, 'ui'),
  ('team.logoAlt', 'SSA logo', 'Logo de SSA', 'Logo de SSA', true, 22, 'ui'),
  ('team.jaz.name', 'Jazmine Dean Perez', 'Jazmine Dean Perez', 'Jazmine Dean Perez', true, 30, 'ui'),
  ('team.card.noPhotos', 'No photos yet', 'Aún no hay fotos', 'Aún no hay fotos', true, 40, 'ui'),
  ('team.card.browseHint', 'Click the arrows to browse photos.', 'Haz clic en las flechas para ver las fotos.', 'Haz clic en las flechas para ver las fotos.', true, 41, 'ui'),
  ('team.card.prevAria', 'previous', 'anterior', 'anterior', true, 42, 'ui'),
  ('team.card.nextAria', 'next', 'siguiente', 'siguiente', true, 43, 'ui'),

  -- Contact page
  ('contact.logoAlt', 'Sunset Surf Academy', 'Sunset Surf Academy', 'Sunset Surf Academy', true, 10, 'ui'),
  ('contact.linksIntro', 'Have questions or want to check our online presence? Check the links below.', '¿Tienes preguntas o quieres ver nuestra presencia en línea? Revisa los enlaces a continuación.', '¿Tienes preguntas o quieres ver nuestra presencia en línea? Revisa los enlaces a continuación.', true, 11, 'ui'),
  ('contact.instagramUrl', 'https://www.instagram.com/sunsetsurfacademy/', 'https://www.instagram.com/sunsetsurfacademy/', 'https://www.instagram.com/sunsetsurfacademy/', true, 20, 'ui'),
  ('contact.instagramHandle', '@sunsetsurfacademy', '@sunsetsurfacademy', '@sunsetsurfacademy', true, 21, 'ui'),
  ('contact.phone', '939-525-0307', '939-525-0307', '939-525-0307', true, 22, 'ui'),
  ('contact.email', 'sunsetsurfacademy@gmail.com', 'sunsetsurfacademy@gmail.com', 'sunsetsurfacademy@gmail.com', true, 23, 'ui'),

  -- Booking page + calendar
  ('booking.title', 'Book Your Lesson', 'Reserva tu lección', 'Reserva tu lección', true, 10, 'ui'),
  ('booking.requestReceived', 'Booking request received!', '¡Solicitud de reserva recibida!', '¡Solicitud de reserva recibida!', true, 11, 'ui'),

  ('booking.steps.chooseLesson', 'Choose Lesson', 'Elige lección', 'Elige lección', true, 20, 'ui'),
  ('booking.steps.selectDateTime', 'Select Date & Time', 'Selecciona fecha y hora', 'Selecciona fecha y hora', true, 21, 'ui'),
  ('booking.steps.customerInfo', 'Customer Info', 'Información del cliente', 'Información del cliente', true, 22, 'ui'),

  ('booking.step0.title', 'Choose Your Lesson and Party Size', 'Elige tu lección y el tamaño del grupo', 'Elige tu lección y el tamaño del grupo', true, 30, 'ui'),
  ('booking.lessonTypeLabel', 'Lesson Type', 'Tipo de lección', 'Tipo de lección', true, 31, 'ui'),
  ('booking.partySizeLabel', 'Party Size', 'Tamaño del grupo', 'Tamaño del grupo', true, 32, 'ui'),
  ('booking.totalLabel', 'Total', 'Total', 'Total', true, 33, 'ui'),
  ('booking.totalBreakdown', '{count} person(s) × ${price}', '{count} persona(s) × ${price}', '{count} persona(s) × ${price}', true, 34, 'ui'),

  ('booking.step1.title', 'Select Your Preferred Date and Time', 'Selecciona tu fecha y hora preferidas', 'Selecciona tu fecha y hora preferidas', true, 40, 'ui'),
  ('booking.dateLabel', 'Date', 'Fecha', 'Fecha', true, 41, 'ui'),
  ('booking.timeLabel', 'Time', 'Hora', 'Hora', true, 42, 'ui'),
  ('booking.timeHelp', 'Pick one or more 30-minute time blocks that work for you; we will send these to the coach for confirmation.', 'Elige uno o más bloques de 30 minutos que te funcionen; se los enviaremos al instructor para confirmación.', 'Elige uno o más bloques de 30 minutos que te funcionen; se los enviaremos al instructor para confirmación.', true, 43, 'ui'),

  ('booking.step2.title', 'Customer Information', 'Información del cliente', 'Información del cliente', true, 50, 'ui'),
  ('booking.fullNameLabel', 'Full Name', 'Nombre completo', 'Nombre completo', true, 51, 'ui'),
  ('booking.emailLabel', 'Email Address', 'Correo electrónico', 'Correo electrónico', true, 52, 'ui'),
  ('booking.phoneLabel', 'Phone Number', 'Número de teléfono', 'Número de teléfono', true, 53, 'ui'),

  ('booking.summary.title', 'Booking Summary', 'Resumen de la reserva', 'Resumen de la reserva', true, 60, 'ui'),
  ('booking.summary.dateLabel', 'Date', 'Fecha', 'Fecha', true, 61, 'ui'),
  ('booking.summary.timeLabel', 'Time', 'Hora', 'Hora', true, 62, 'ui'),
  ('booking.summary.lessonLabel', 'Lesson', 'Lección', 'Lección', true, 63, 'ui'),
  ('booking.summary.partySizeLabel', 'Party Size', 'Tamaño del grupo', 'Tamaño del grupo', true, 64, 'ui'),

  ('booking.actions.back', 'Back', 'Atrás', 'Atrás', true, 70, 'ui'),
  ('booking.actions.next', 'Next', 'Siguiente', 'Siguiente', true, 71, 'ui'),
  ('booking.actions.submit', 'Submit Request', 'Enviar solicitud', 'Enviar solicitud', true, 72, 'ui'),

  ('booking.adminPhone', '939-525-0307', '939-525-0307', '939-525-0307', true, 80, 'ui'),
  ('booking.adminEmail', 'sunsetsurfacademy@gmail.com', 'sunsetsurfacademy@gmail.com', 'sunsetsurfacademy@gmail.com', true, 81, 'ui'),

  ('booking.lessonTypes.beginner', 'Beginner Lesson (2 hours)', 'Lección para principiantes (2 horas)', 'Lección para principiantes (2 horas)', true, 90, 'ui'),
  ('booking.lessonTypes.intermediate', 'Intermediate Lesson (2 hours)', 'Lección intermedia (2 horas)', 'Lección intermedia (2 horas)', true, 91, 'ui'),
  ('booking.lessonTypes.advanced', 'Advanced Coaching (2 hours)', 'Coaching avanzado (2 horas)', 'Coaching avanzado (2 horas)', true, 92, 'ui')
on conflict (page_key) do update
set
  body_en = excluded.body_en,
  body_es_draft = excluded.body_es_draft,
  body_es_published = excluded.body_es_published,
  approved = excluded.approved,
  sort = excluded.sort,
  category = excluded.category,
  updated_at = now();

-- =========================
-- Legacy keys preserved from backend snapshot (older key names)
-- =========================
insert into public.cms_page_content (page_key, body_en, body_es_draft, body_es_published, approved, sort, category)
values
  -- Older navigation.* keys
  ('navigation.home', 'Home', 'Inicio', 'Inicio', true, 32767, 'messages'),
  ('navigation.lessons', 'Lessons', 'Lecciones', 'Lecciones', true, 32767, 'messages'),
  ('navigation.schedule', 'Book Now', 'Reservar', 'Reservar', true, 32767, 'messages'),
  ('navigation.gallery', 'Gallery', 'Galería', 'Galería', true, 32767, 'messages'),
  ('navigation.about', 'About', 'Acerca de', 'Acerca de', true, 32767, 'messages'),
  ('navigation.faq', 'FAQ', 'Preguntas', 'Preguntas', true, 32767, 'messages'),
  ('navigation.contact', 'Contact', 'Contacto', 'Contacto', true, 32767, 'messages'),

  -- Older home.* keys
  ('home.heroTitle', 'Learn to Surf at Sunset Surf Academy', 'Aprende a surfear en Sunset Surf Academy', 'Aprende a surfear en Sunset Surf Academy', true, 32767, 'messages'),
  ('home.heroSubtitle', 'Professional surf instruction in the beautiful waters of Rincón, Puerto Rico', 'Instrucción profesional de surf en las hermosas aguas de Rincón, Puerto Rico', 'Instrucción profesional de surf en las hermosas aguas de Rincón, Puerto Rico', true, 32767, 'messages'),
  ('home.bookNow', 'Book Your Lesson', 'Reserva tu lección', 'Reserva tu lección', true, 32767, 'messages'),
  ('home.learnMore', 'Learn More', 'Saber más', 'Saber más', true, 32767, 'messages'),
  ('home.lessonsTitle', 'Surf Lessons', 'Lecciones de surf', 'Lecciones de surf', true, 32767, 'messages'),
  ('home.lessonsDescription', 'From beginner-friendly sessions to advanced coaching', 'Desde sesiones para principiantes hasta coaching avanzado', 'Desde sesiones para principiantes hasta coaching avanzado', true, 32767, 'messages'),
  ('home.galleryTitle', 'Experience the Journey', 'Vive la experiencia', 'Vive la experiencia', true, 32767, 'messages'),
  ('home.galleryDescription', 'Watch videos and see photos from our surf adventures', 'Mira videos y fotos de nuestras aventuras de surf', 'Mira videos y fotos de nuestras aventuras de surf', true, 32767, 'messages'),
  ('home.teamTitle', 'Meet the Team', 'Conoce al equipo', 'Conoce al equipo', true, 32767, 'messages'),
  ('home.teamDescription', 'Get to know the coaches who make Sunset Surf Academy special', 'Conoce a los entrenadores que hacen especial a Sunset Surf Academy', 'Conoce a los entrenadores que hacen especial a Sunset Surf Academy', true, 32767, 'messages'),

  -- Older contact.* keys
  ('contact.title', 'Contact Jazmine', 'Contacta a Jazmine', 'Contacta a Jazmine', true, 32767, 'messages'),
  ('contact.subtitle', 'Ready to book or have questions? Get in touch!', '¿Listo para reservar o tienes preguntas? ¡Ponte en contacto!', '¿Listo para reservar o tienes preguntas? ¡Ponte en contacto!', true, 32767, 'messages'),
  ('contact.location', 'Rincón, Puerto Rico', 'Rincón, Puerto Rico', 'Rincón, Puerto Rico', true, 32767, 'messages'),
  ('contact.followUs', 'Follow Us', 'Síguenos', 'Síguenos', true, 32767, 'messages'),

  -- Older booking.* keys
  ('booking.lessonType', 'Lesson Type', 'Tipo de lección', 'Tipo de lección', true, 32767, 'messages'),
  ('booking.partySize', 'Party Size', 'Tamaño del grupo', 'Tamaño del grupo', true, 32767, 'messages'),
  ('booking.selectDate', 'Select Date', 'Selecciona una fecha', 'Selecciona una fecha', true, 32767, 'messages'),
  ('booking.selectTime', 'Select Time', 'Selecciona una hora', 'Selecciona una hora', true, 32767, 'messages'),
  ('booking.customerInfo', 'Customer Information', 'Información del cliente', 'Información del cliente', true, 32767, 'messages'),
  ('booking.name', 'Full Name', 'Nombre completo', 'Nombre completo', true, 32767, 'messages'),
  ('booking.email', 'Email Address', 'Correo electrónico', 'Correo electrónico', true, 32767, 'messages'),
  ('booking.phone', 'Phone Number', 'Número de teléfono', 'Número de teléfono', true, 32767, 'messages'),
  ('booking.totalPrice', 'Total Price', 'Precio total', 'Precio total', true, 32767, 'messages'),
  ('booking.proceedToPayment', 'Proceed to Payment', 'Continuar al pago', 'Continuar al pago', true, 32767, 'messages')
on conflict (page_key) do update
set
  body_en = excluded.body_en,
  body_es_draft = excluded.body_es_draft,
  body_es_published = excluded.body_es_published,
  approved = excluded.approved,
  sort = excluded.sort,
  category = excluded.category,
  updated_at = now();

-- =========================
-- Public site page strings (home/lessons/faq/mission/about/gallery + lang toggle)
-- =========================
insert into public.cms_page_content (page_key, body_en, body_es_draft, body_es_published, approved, sort, category)
values
  -- Page bodies (rich text). Seed as empty doc so rows exist for editing.
  ('about_jaz', '{"type":"doc","content":[]}', '{"type":"doc","content":[]}', '{"type":"doc","content":[]}', true, 1, 'page'),
  ('contact', '{"type":"doc","content":[]}', '{"type":"doc","content":[]}', '{"type":"doc","content":[]}', true, 2, 'page'),
  ('faq', '{"type":"doc","content":[]}', '{"type":"doc","content":[]}', '{"type":"doc","content":[]}', true, 3, 'page'),
  ('lessons', '{"type":"doc","content":[]}', '{"type":"doc","content":[]}', '{"type":"doc","content":[]}', true, 4, 'page'),
  ('mission_statement', '{"type":"doc","content":[]}', '{"type":"doc","content":[]}', '{"type":"doc","content":[]}', true, 5, 'page'),
  ('team', '{"type":"doc","content":[]}', '{"type":"doc","content":[]}', '{"type":"doc","content":[]}', true, 6, 'page'),

  -- Language toggle
  ('nav.langToggle.en', 'EN', 'EN', 'EN', true, 100, 'ui'),
  ('nav.langToggle.es', 'ES', 'ES', 'ES', true, 101, 'ui'),

  -- Home page
  ('home.hero.title', 'Learn to Surf at Sunset Surf Academy', 'Aprende a surfear en Sunset Surf Academy', 'Aprende a surfear en Sunset Surf Academy', true, 10, 'ui'),
  ('home.hero.subtitle', 'Professional surf instruction in the beautiful waters of Rincón, Puerto Rico', 'Instrucción profesional de surf en las hermosas aguas de Rincón, Puerto Rico', 'Instrucción profesional de surf en las hermosas aguas de Rincón, Puerto Rico', true, 11, 'ui'),
  ('home.hero.primaryAction', 'Book Your Lesson', 'Reserva tu lección', 'Reserva tu lección', true, 12, 'ui'),
  ('home.hero.secondaryAction', 'Learn More', 'Saber más', 'Saber más', true, 13, 'ui'),
  ('home.aboutPreview', 'Learn from some of the best surfers in the world.', 'Aprende con algunos de los mejores surfistas del mundo.', 'Aprende con algunos de los mejores surfistas del mundo.', true, 20, 'ui'),

  ('home.cards.lessons.title', 'Surf Lessons', 'Lecciones de surf', 'Lecciones de surf', true, 30, 'ui'),
  ('home.cards.lessons.description', 'From beginner-friendly sessions to advanced coaching', 'Desde sesiones para principiantes hasta coaching avanzado', 'Desde sesiones para principiantes hasta coaching avanzado', true, 31, 'ui'),

  ('home.cards.gallery.title', 'Experience the Journey', 'Vive la experiencia', 'Vive la experiencia', true, 40, 'ui'),
  ('home.cards.gallery.description', 'Watch videos and see photos from our surf adventures', 'Mira videos y fotos de nuestras aventuras de surf', 'Mira videos y fotos de nuestras aventuras de surf', true, 41, 'ui'),

  ('home.cards.team.title', 'Meet the Team', 'Conoce al equipo', 'Conoce al equipo', true, 50, 'ui'),
  ('home.cards.team.description', 'Get to know the coaches who make Sunset Surf Academy special', 'Conoce a los entrenadores que hacen especial a Sunset Surf Academy', 'Conoce a los entrenadores que hacen especial a Sunset Surf Academy', true, 51, 'ui'),
  ('home.cards.team.imageAlt', 'Meet the team', 'Conoce al equipo', 'Conoce al equipo', true, 52, 'ui'),

  -- Lessons page
  ('lessons.title', 'Surf Lessons', 'Lecciones de surf', 'Lecciones de surf', true, 10, 'ui'),
  ('lessons.subtitle', 'Professional instruction tailored to your skill level', 'Instrucción profesional adaptada a tu nivel', 'Instrucción profesional adaptada a tu nivel', true, 11, 'ui'),
  ('lessons.pricesAlt', 'Prices', 'Precios', 'Precios', true, 12, 'ui'),

  ('lessons.card.perPersonLabel', 'per person', 'por persona', 'por persona', true, 20, 'ui'),
  ('lessons.card.includesLabel', 'What''s Included:', 'Qué incluye:', 'Qué incluye:', true, 21, 'ui'),
  ('lessons.card.bookCta', 'Book This Lesson', 'Reservar esta lección', 'Reservar esta lección', true, 22, 'ui'),
  ('lessons.card.contactPricingValue', 'Contact for pricing', 'Contacta para precios', 'Contacta para precios', true, 23, 'ui'),

  ('lessons.beginner.title', 'Lessons', 'Lecciones', 'Lecciones', true, 30, 'ui'),
  ('lessons.beginner.price', '$100', '$100', '$100', true, 31, 'ui'),
  ('lessons.beginner.duration', '2 hours', '2 horas', '2 horas', true, 32, 'ui'),
  ('lessons.beginner.location', 'Rincón to Isabela/Jobos', 'Rincón a Isabela/Jobos', 'Rincón a Isabela/Jobos', true, 33, 'ui'),
  ('lessons.beginner.description', 'The beginner lessons teach the fundamentals of surfing.', 'Las lecciones para principiantes enseñan los fundamentos del surf.', 'Las lecciones para principiantes enseñan los fundamentos del surf.', true, 34, 'ui'),
  ('lessons.beginner.includes.0', 'Surfboard rental', 'Alquiler de tabla de surf', 'Alquiler de tabla de surf', true, 35, 'ui'),
  ('lessons.beginner.includes.1', 'Safety briefing', 'Briefing de seguridad', 'Briefing de seguridad', true, 36, 'ui'),
  ('lessons.beginner.includes.2', 'Personalized beach & water coaching', 'Coaching personalizado en playa y agua', 'Coaching personalizado en playa y agua', true, 37, 'ui'),
  ('lessons.beginner.includes.3', 'Photos of your session', 'Fotos de tu sesión', 'Fotos de tu sesión', true, 38, 'ui'),

  ('lessons.intermediate.title', 'Advanced Coaching', 'Coaching avanzado', 'Coaching avanzado', true, 50, 'ui'),
  ('lessons.intermediate.price', '$100', '$100', '$100', true, 51, 'ui'),
  ('lessons.intermediate.duration', '2 hours', '2 horas', '2 horas', true, 52, 'ui'),
  ('lessons.intermediate.location', 'Rincón to Isabela/Jobos', 'Rincón a Isabela/Jobos', 'Rincón a Isabela/Jobos', true, 53, 'ui'),
  ('lessons.intermediate.description', 'Intermediate lessons teach how to read waves, interact in any lineup, and gain practical skills to surf more confidently.', 'Las lecciones intermedias enseñan a leer las olas, interactuar en cualquier line up y desarrollar habilidades prácticas para surfear con más confianza.', 'Las lecciones intermedias enseñan a leer las olas, interactuar en cualquier line up y desarrollar habilidades prácticas para surfear con más confianza.', true, 54, 'ui'),
  ('lessons.intermediate.includes.0', 'Surfboard rental', 'Alquiler de tabla de surf', 'Alquiler de tabla de surf', true, 55, 'ui'),
  ('lessons.intermediate.includes.1', 'Wave reading & lineup etiquette', 'Lectura de olas y etiqueta en el line up', 'Lectura de olas y etiqueta en el line up', true, 56, 'ui'),
  ('lessons.intermediate.includes.2', 'Skills development', 'Desarrollo de habilidades', 'Desarrollo de habilidades', true, 57, 'ui'),
  ('lessons.intermediate.includes.3', 'Photos and short video clips', 'Fotos y clips cortos de video', 'Fotos y clips cortos de video', true, 58, 'ui'),

  ('lessons.advanced.title', 'Surf Guide', 'Guía de surf', 'Guía de surf', true, 70, 'ui'),
  ('lessons.advanced.price', '$100', '$100', '$100', true, 71, 'ui'),
  ('lessons.advanced.duration', '2 hours', '2 horas', '2 horas', true, 72, 'ui'),
  ('lessons.advanced.location', 'Various locations', 'Varias ubicaciones', 'Varias ubicaciones', true, 73, 'ui'),
  ('lessons.advanced.description', 'Advanced lessons cover advanced skills, video analysis, competition preparation, and custom programs.', 'Las lecciones avanzadas cubren habilidades avanzadas, análisis de video, preparación para competencias y programas personalizados.', 'Las lecciones avanzadas cubren habilidades avanzadas, análisis de video, preparación para competencias y programas personalizados.', true, 74, 'ui'),
  ('lessons.advanced.includes.0', 'Video review', 'Revisión de video', 'Revisión de video', true, 75, 'ui'),
  ('lessons.advanced.includes.1', 'Technique analysis', 'Análisis de técnica', 'Análisis de técnica', true, 76, 'ui'),
  ('lessons.advanced.includes.2', 'Competition prep', 'Preparación para competencias', 'Preparación para competencias', true, 77, 'ui'),
  ('lessons.advanced.includes.3', 'Custom programs', 'Programas personalizados', 'Programas personalizados', true, 78, 'ui'),

  -- FAQ page
  ('faq.title', 'Frequently Asked Questions', 'Preguntas frecuentes', 'Preguntas frecuentes', true, 10, 'ui'),
  ('faq.questions.0.question', 'Where do we meet for lessons?', '¿Dónde nos encontramos para las lecciones?', '¿Dónde nos encontramos para las lecciones?', true, 20, 'ui'),
  ('faq.questions.0.answer', 'We are based out of Rincón, Puerto Rico, and primarily conduct lessons at our local beach breaks. However, when conditions are favorable and upon request, we''re happy to travel anywhere along the coast from Rincón up to Jobos and all the spots in between to find the perfect waves for your lesson.', 'Estamos ubicados en Rincón, Puerto Rico, y principalmente realizamos lecciones en nuestras playas locales. Sin embargo, cuando las condiciones son favorables y bajo pedido, podemos viajar a cualquier lugar a lo largo de la costa desde Rincón hasta Jobos y todos los lugares intermedios para encontrar las olas perfectas para tu lección.', 'Estamos ubicados en Rincón, Puerto Rico, y principalmente realizamos lecciones en nuestras playas locales. Sin embargo, cuando las condiciones son favorables y bajo pedido, podemos viajar a cualquier lugar a lo largo de la costa desde Rincón hasta Jobos y todos los lugares intermedios para encontrar las olas perfectas para tu lección.', true, 21, 'ui'),
  ('faq.questions.1.question', 'What''s included in beginner lessons?', '¿Qué incluyen las lecciones para principiantes?', '¿Qué incluyen las lecciones para principiantes?', true, 22, 'ui'),
  ('faq.questions.1.answer', 'Beginner lessons include surfboard rental, comprehensive safety briefing, personalized coaching both on the beach and in the water, and photos of your surf session to capture your progress and memorable moments.', 'Las lecciones para principiantes incluyen alquiler de tabla de surf, un briefing de seguridad completo, coaching personalizado en la playa y en el agua, y fotos de tu sesión para capturar tu progreso y momentos memorables.', 'Las lecciones para principiantes incluyen alquiler de tabla de surf, un briefing de seguridad completo, coaching personalizado en la playa y en el agua, y fotos de tu sesión para capturar tu progreso y momentos memorables.', true, 23, 'ui'),
  ('faq.questions.2.question', 'What''s included in advanced coaching?', '¿Qué incluye el coaching avanzado?', '¿Qué incluye el coaching avanzado?', true, 24, 'ui'),
  ('faq.questions.2.answer', 'Advanced coaching is a comprehensive multi-session program that includes video analysis of your surfing. We start with a baseline session where we film your surfing, then review the footage together to identify areas for improvement. This is followed by a theory-to-practice session where you apply the techniques we''ve discussed, creating a complete learning cycle for advanced skill development.', 'El coaching avanzado es un programa completo de varias sesiones que incluye análisis de video de tu surf. Comenzamos con una sesión base donde filmamos tu surf, luego revisamos el material juntos para identificar áreas de mejora. Después, realizamos una sesión de teoría a práctica donde aplicas las técnicas discutidas, creando un ciclo completo de aprendizaje para el desarrollo de habilidades avanzadas.', 'El coaching avanzado es un programa completo de varias sesiones que incluye análisis de video de tu surf. Comenzamos con una sesión base donde filmamos tu surf, luego revisamos el material juntos para identificar áreas de mejora. Después, realizamos una sesión de teoría a práctica donde aplicas las técnicas discutidas, creando un ciclo completo de aprendizaje para el desarrollo de habilidades avanzadas.', true, 25, 'ui'),
  ('faq.questions.3.question', 'Can I reschedule my lesson?', '¿Puedo reprogramar mi lección?', '¿Puedo reprogramar mi lección?', true, 26, 'ui'),
  ('faq.questions.3.answer', 'Yes, we offer flexible rescheduling options based on weather conditions and your availability.', 'Sí, ofrecemos opciones flexibles de reprogramación según las condiciones del clima y tu disponibilidad.', 'Sí, ofrecemos opciones flexibles de reprogramación según las condiciones del clima y tu disponibilidad.', true, 27, 'ui'),
  ('faq.questions.4.question', 'Are lessons suitable for complete beginners?', '¿Las lecciones son adecuadas para principiantes completos?', '¿Las lecciones son adecuadas para principiantes completos?', true, 28, 'ui'),
  ('faq.questions.4.answer', 'Absolutely! Our beginner lessons are specifically designed for first-time surfers of all ages.', '¡Absolutamente! Nuestras lecciones para principiantes están diseñadas específicamente para surfistas primerizos de todas las edades.', '¡Absolutamente! Nuestras lecciones para principiantes están diseñadas específicamente para surfistas primerizos de todas las edades.', true, 29, 'ui'),
  ('faq.questions.5.question', 'Do you offer group and family lessons?', '¿Ofrecen lecciones grupales y familiares?', '¿Ofrecen lecciones grupales y familiares?', true, 30, 'ui'),
  ('faq.questions.5.answer', 'Yes, we welcome groups and families. Contact us for special group rates and custom arrangements.', 'Sí, damos la bienvenida a grupos y familias. Contáctanos para tarifas especiales para grupos y arreglos personalizados.', 'Sí, damos la bienvenida a grupos y familias. Contáctanos para tarifas especiales para grupos y arreglos personalizados.', true, 31, 'ui'),
  ('faq.questions.6.question', 'What''s your refund policy?', '¿Cuál es su política de reembolso?', '¿Cuál es su política de reembolso?', true, 32, 'ui'),
  ('faq.questions.6.answer', 'We offer full refunds for cancellations due to unsafe weather conditions. Other cancellations require 24-hour notice.', 'Ofrecemos reembolsos completos por cancelaciones debido a condiciones climáticas inseguras. Otras cancelaciones requieren aviso con 24 horas de anticipación.', 'Ofrecemos reembolsos completos por cancelaciones debido a condiciones climáticas inseguras. Otras cancelaciones requieren aviso con 24 horas de anticipación.', true, 33, 'ui'),

  -- Mission statement
  ('mission.title', 'Our Mission', 'Nuestra misión', 'Nuestra misión', true, 10, 'ui'),
  ('mission.subtitle', 'Take Every Surfer To The Next Level', 'Llevar a cada surfista al siguiente nivel', 'Llevar a cada surfista al siguiente nivel', true, 11, 'ui'),
  ('mission.lead', 'At Sunset Surf Academy our mission is simple: to help every surfer — from complete beginners to seasoned competitors — progress, have more fun, and get better results in the water.', 'En Sunset Surf Academy nuestra misión es simple: ayudar a cada surfista — desde principiantes completos hasta competidores experimentados — a progresar, divertirse más y obtener mejores resultados en el agua.', 'En Sunset Surf Academy nuestra misión es simple: ayudar a cada surfista — desde principiantes completos hasta competidores experimentados — a progresar, divertirse más y obtener mejores resultados en el agua.', true, 20, 'ui'),
  ('mission.body1', 'We believe surfing is for everyone. For first-timers we focus on water safety, confidence-building and the fundamentals so your first waves are empowering and memorable. For intermediate and advanced surfers we offer technique work, video analysis and competition preparation that targets measurable improvement.', 'Creemos que el surf es para todos. Para quienes lo prueban por primera vez, nos enfocamos en la seguridad en el agua, construir confianza y los fundamentos para que tus primeras olas sean empoderadoras y memorables. Para surfistas intermedios y avanzados, ofrecemos técnica, análisis de video y preparación para competencias con mejoras medibles.', 'Creemos que el surf es para todos. Para quienes lo prueban por primera vez, nos enfocamos en la seguridad en el agua, construir confianza y los fundamentos para que tus primeras olas sean empoderadoras y memorables. Para surfistas intermedios y avanzados, ofrecemos técnica, análisis de video y preparación para competencias con mejoras medibles.', true, 21, 'ui'),
  ('mission.body2', 'Our coaches design lessons around your goals — whether that’s catching your first wave, improving your bottom turns, boosting aerials, or nailing contest-worthy maneuvers. We emphasize clear coaching, practical drills, and a supportive environment that accelerates learning while keeping the stoke alive.', 'Nuestros entrenadores diseñan lecciones según tus objetivos — ya sea atrapar tu primera ola, mejorar tus bottom turns, perfeccionar aéreos o dominar maniobras dignas de competencia. Enfatizamos coaching claro, ejercicios prácticos y un ambiente de apoyo que acelera el aprendizaje manteniendo la emoción viva.', 'Nuestros entrenadores diseñan lecciones según tus objetivos — ya sea atrapar tu primera ola, mejorar tus bottom turns, perfeccionar aéreos o dominar maniobras dignas de competencia. Enfatizamos coaching claro, ejercicios prácticos y un ambiente de apoyo que acelera el aprendizaje manteniendo la emoción viva.', true, 22, 'ui'),
  ('mission.conclusion', 'Ultimately, success at Sunset Surf Academy isn''t just measured in scores; it''s measured in smiles, confidence and the endless pursuit of better surfing. Come surf with us and let''s take your surfing to the next level.', 'En última instancia, el éxito en Sunset Surf Academy no se mide solo en puntuaciones; se mide en sonrisas, confianza y la búsqueda interminable de un mejor surf. Ven a surfear con nosotros y llevemos tu surf al siguiente nivel.', 'En última instancia, el éxito en Sunset Surf Academy no se mide solo en puntuaciones; se mide en sonrisas, confianza y la búsqueda interminable de un mejor surf. Ven a surfear con nosotros y llevemos tu surf al siguiente nivel.', true, 23, 'ui'),
  ('mission.logoAlt', 'SSA Logo', 'Logo de SSA', 'Logo de SSA', true, 30, 'ui'),

  -- About Jaz
  ('about.title', 'About Jazmine Dean Perez', 'Sobre Jazmine Dean Perez', 'Sobre Jazmine Dean Perez', true, 10, 'ui'),
  ('about.subtitle', 'Professional Surfer & Instructor', 'Surfista profesional e instructora', 'Surfista profesional e instructora', true, 11, 'ui'),
  ('about.bio', 'Jazmine Dean is a professional surfer representing Team Puerto Rico with an impressive competitive record. Based in the world-renowned surf town of Rincón, she brings years of experience and passion to every lesson.', 'Jazmine Dean es una surfista profesional que representa al Equipo Puerto Rico con un impresionante historial competitivo. Basada en el mundialmente reconocido pueblo de surf de Rincón, aporta años de experiencia y pasión a cada lección.', 'Jazmine Dean es una surfista profesional que representa al Equipo Puerto Rico con un impresionante historial competitivo. Basada en el mundialmente reconocido pueblo de surf de Rincón, aporta años de experiencia y pasión a cada lección.', true, 20, 'ui'),
  ('about.achievements', 'Achievements', 'Logros', 'Logros', true, 21, 'ui'),
  ('about.accolades.0', '4x East Coast Champion', '4x campeona de la Costa Este', '4x campeona de la Costa Este', true, 30, 'ui'),
  ('about.accolades.1', 'Pan-American Games 2nd Place', '2.º lugar en los Juegos Panamericanos', '2.º lugar en los Juegos Panamericanos', true, 31, 'ui'),
  ('about.accolades.2', 'ISA World Surfing Games Competitor', 'Competidora en los Juegos Mundiales de Surf ISA', 'Competidora en los Juegos Mundiales de Surf ISA', true, 32, 'ui'),
  ('about.accolades.3', 'Team Puerto Rico Member', 'Miembro del Equipo Puerto Rico', 'Miembro del Equipo Puerto Rico', true, 33, 'ui'),
  ('about.accolades.4', 'Professional Surf Instructor', 'Instructora profesional de surf', 'Instructora profesional de surf', true, 34, 'ui'),

  -- Gallery page
  ('gallery.title', 'Gallery', 'Galería', 'Galería', true, 10, 'ui'),
  ('gallery.subtitle', 'Check out some of the content from our past lessons :)', 'Mira contenido de algunas lecciones pasadas :)', 'Mira contenido de algunas lecciones pasadas :)', true, 11, 'ui'),
  ('gallery.empty', 'No gallery media selected yet.', 'Aún no se ha seleccionado contenido para la galería.', 'Aún no se ha seleccionado contenido para la galería.', true, 12, 'ui')
on conflict (page_key) do update
set
  body_en = excluded.body_en,
  body_es_draft = excluded.body_es_draft,
  body_es_published = excluded.body_es_published,
  approved = excluded.approved,
  sort = excluded.sort,
  category = excluded.category,
  updated_at = now();

-- =========================
-- Admin UI strings (admin.* + gallery slots count)
-- =========================
insert into public.cms_page_content (page_key, body_en, body_es_draft, body_es_published, approved, sort, category)
values
  -- Gallery slots config uses a CMS key for the count
  ('gallery.images.count', '12', '12', '12', true, 1, 'ui'),

  -- Common
  ('admin.common.loading', 'Loading…', 'Cargando…', 'Cargando…', true, 10, 'ui'),
  ('admin.common.refresh', 'Refresh', 'Actualizar', 'Actualizar', true, 11, 'ui'),
  ('admin.common.save', 'Save', 'Guardar', 'Guardar', true, 12, 'ui'),
  ('admin.common.saving', 'Saving…', 'Guardando…', 'Guardando…', true, 13, 'ui'),
  ('admin.common.cancel', 'Cancel', 'Cancelar', 'Cancelar', true, 14, 'ui'),
  ('admin.common.edit', 'Edit', 'Editar', 'Editar', true, 15, 'ui'),
  ('admin.common.publish', 'Publish', 'Publicar', 'Publicar', true, 16, 'ui'),
  ('admin.common.yes', 'Yes', 'Sí', 'Sí', true, 17, 'ui'),
  ('admin.common.no', 'No', 'No', 'No', true, 18, 'ui'),
  ('admin.common.none', '—', '—', '—', true, 19, 'ui'),

  -- Auth / nav
  ('admin.auth.notAuthorizedTitle', 'Not authorized', 'No autorizado', 'No autorizado', true, 30, 'ui'),
  ('admin.auth.notAuthorizedBody', 'You must sign in to view the admin area.', 'Debes iniciar sesión para ver el área de administración.', 'Debes iniciar sesión para ver el área de administración.', true, 31, 'ui'),
  ('admin.auth.goToLogin', 'Go to Admin Login', 'Ir al inicio de sesión de administrador', 'Ir al inicio de sesión de administrador', true, 32, 'ui'),
  ('admin.auth.signOut', 'Sign out', 'Cerrar sesión', 'Cerrar sesión', true, 33, 'ui'),
  ('admin.nav.backToAdmin', 'Back to Admin', 'Volver al panel', 'Volver al panel', true, 34, 'ui'),

  -- Dashboard
  ('admin.dashboard.title', 'Admin Dashboard', 'Panel de administración', 'Panel de administración', true, 40, 'ui'),
  ('admin.dashboard.subtitle', 'CMS bodies, sessions, and media.', 'Cuerpos del CMS, sesiones y medios.', 'Cuerpos del CMS, sesiones y medios.', true, 41, 'ui'),
  ('admin.dashboard.tabs.edit', 'Edit', 'Editar', 'Editar', true, 42, 'ui'),
  ('admin.dashboard.tabs.sessions', 'Sessions', 'Sesiones', 'Sesiones', true, 43, 'ui'),
  ('admin.dashboard.tabs.media', 'Media', 'Medios', 'Medios', true, 44, 'ui'),
  ('admin.dashboard.editHint', 'You are viewing the real site UI. Click the edit icons to change content inline.', 'Estás viendo la interfaz real del sitio. Haz clic en los iconos de edición para cambiar el contenido en línea.', 'Estás viendo la interfaz real del sitio. Haz clic en los iconos de edición para cambiar el contenido en línea.', true, 45, 'ui'),
  ('admin.dashboard.goToUpload', 'Go to Upload Page', 'Ir a la página de carga', 'Ir a la página de carga', true, 46, 'ui'),

  -- Login
  ('admin.login.title', 'Admin Login', 'Inicio de sesión de administrador', 'Inicio de sesión de administrador', true, 60, 'ui'),
  ('admin.login.subtitle', 'This page is not linked from the site — enter the direct URL to access it.', 'Esta página no está enlazada desde el sitio — ingresa la URL directa para acceder.', 'Esta página no está enlazada desde el sitio — ingresa la URL directa para acceder.', true, 61, 'ui'),
  ('admin.login.emailLabel', 'Email', 'Correo electrónico', 'Correo electrónico', true, 62, 'ui'),
  ('admin.login.passwordLabel', 'Password', 'Contraseña', 'Contraseña', true, 63, 'ui'),
  ('admin.login.signIn', 'Sign in', 'Iniciar sesión', 'Iniciar sesión', true, 64, 'ui'),
  ('admin.login.signingIn', 'Signing in…', 'Iniciando sesión…', 'Iniciando sesión…', true, 65, 'ui'),
  ('admin.login.errors.signInFailed', 'Sign-in failed', 'Error al iniciar sesión', 'Error al iniciar sesión', true, 66, 'ui'),
  ('admin.login.errors.invalidCredentials', 'Invalid credentials', 'Credenciales inválidas', 'Credenciales inválidas', true, 67, 'ui'),
  ('admin.login.errors.network', 'Network error', 'Error de red', 'Error de red', true, 68, 'ui'),

  -- Live editor
  ('admin.liveEditor.pageLabel', 'Page', 'Página', 'Página', true, 80, 'ui'),
  ('admin.liveEditor.unknownPage', 'Unknown page: {page}', 'Página desconocida: {page}', 'Página desconocida: {page}', true, 81, 'ui'),

  -- Inline edit UI
  ('admin.edit.errors.saveFailed', 'Save failed', 'Error al guardar', 'Error al guardar', true, 90, 'ui'),
  ('admin.edit.errors.publishFailed', 'Publish failed', 'Error al publicar', 'Error al publicar', true, 91, 'ui'),
  ('admin.edit.richText.contentLabel', 'Content', 'Contenido', 'Contenido', true, 92, 'ui'),
  ('admin.edit.translate.action', 'Translate to Spanish', 'Traducir al español', 'Traducir al español', true, 93, 'ui'),
  ('admin.edit.translate.translating', 'Translating…', 'Traduciendo…', 'Traduciendo…', true, 94, 'ui'),
  ('admin.edit.translate.nothingToTranslate', 'Nothing to translate yet.', 'Nada para traducir todavía.', 'Nada para traducir todavía.', true, 95, 'ui'),
  ('admin.edit.translate.failed', 'Translate failed', 'Error de traducción', 'Error de traducción', true, 96, 'ui'),
  ('admin.edit.translate.spanishDraftLabel', 'Spanish (draft)', 'Español (borrador)', 'Español (borrador)', true, 97, 'ui'),

  -- Rich text toolbar
  ('admin.richText.bold', 'Bold', 'Negrita', 'Negrita', true, 110, 'ui'),
  ('admin.richText.italic', 'Italic', 'Cursiva', 'Cursiva', true, 111, 'ui'),
  ('admin.richText.bullets', 'Bullets', 'Viñetas', 'Viñetas', true, 112, 'ui'),
  ('admin.richText.numbered', 'Numbered', 'Numerado', 'Numerado', true, 113, 'ui'),
  ('admin.richText.textColor', 'Text color', 'Color de texto', 'Color de texto', true, 114, 'ui'),
  ('admin.richText.resetColor', 'Reset color', 'Restablecer color', 'Restablecer color', true, 115, 'ui'),

  -- Sessions
  ('admin.sessions.title', 'Sessions', 'Sesiones', 'Sesiones', true, 130, 'ui'),
  ('admin.sessions.subtitle', 'Uses existing `admin_*_session` RPCs. Deleted sessions are soft-deleted via `deleted_at`.', 'Usa los RPC `admin_*_session` existentes. Las sesiones eliminadas se eliminan de forma suave vía `deleted_at`.', 'Usa los RPC `admin_*_session` existentes. Las sesiones eliminadas se eliminan de forma suave vía `deleted_at`.', true, 131, 'ui'),
  ('admin.sessions.includeDeleted', 'Include deleted', 'Incluir eliminadas', 'Incluir eliminadas', true, 132, 'ui'),
  ('admin.sessions.empty', 'No sessions found.', 'No se encontraron sesiones.', 'No se encontraron sesiones.', true, 133, 'ui'),
  ('admin.sessions.deletedMarker', ' • Deleted', ' • Eliminada', ' • Eliminada', true, 134, 'ui'),

  ('admin.sessions.create.clientNamesLabel', 'Client names (comma-separated)', 'Nombres de clientes (separados por comas)', 'Nombres de clientes (separados por comas)', true, 140, 'ui'),
  ('admin.sessions.create.groupSizeLabel', 'Group size', 'Tamaño del grupo', 'Tamaño del grupo', true, 141, 'ui'),
  ('admin.sessions.create.sessionTimeLabel', 'Session time', 'Hora de la sesión', 'Hora de la sesión', true, 142, 'ui'),
  ('admin.sessions.create.creating', 'Creating…', 'Creando…', 'Creando…', true, 143, 'ui'),
  ('admin.sessions.create.create', 'Create', 'Crear', 'Crear', true, 144, 'ui'),

  ('admin.sessions.fields.group', 'Group', 'Grupo', 'Grupo', true, 150, 'ui'),
  ('admin.sessions.fields.paid', 'Paid', 'Pagado', 'Pagado', true, 151, 'ui'),
  ('admin.sessions.fields.tip', 'Tip', 'Propina', 'Propina', true, 152, 'ui'),
  ('admin.sessions.fields.status', 'Status', 'Estado', 'Estado', true, 153, 'ui'),
  ('admin.sessions.fields.time', 'Time', 'Hora', 'Hora', true, 154, 'ui'),

  ('admin.sessions.actions.restore', 'Restore', 'Restaurar', 'Restaurar', true, 160, 'ui'),
  ('admin.sessions.actions.hardDelete', 'Hard delete', 'Eliminar definitivamente', 'Eliminar definitivamente', true, 161, 'ui'),
  ('admin.sessions.actions.delete', 'Delete', 'Eliminar', 'Eliminar', true, 162, 'ui'),

  ('admin.sessions.errors.loadFailed', 'Failed to load sessions', 'No se pudieron cargar las sesiones', 'No se pudieron cargar las sesiones', true, 170, 'ui'),
  ('admin.sessions.errors.createFailed', 'Failed to create session', 'No se pudo crear la sesión', 'No se pudo crear la sesión', true, 171, 'ui'),
  ('admin.sessions.errors.updateFailed', 'Failed to update session', 'No se pudo actualizar la sesión', 'No se pudo actualizar la sesión', true, 172, 'ui'),
  ('admin.sessions.errors.operationFailed', 'Operation failed', 'La operación falló', 'La operación falló', true, 173, 'ui'),

  ('admin.sessions.status.booked', 'Booked', 'Reservada', 'Reservada', true, 180, 'ui'),
  ('admin.sessions.status.completed', 'Completed', 'Completada', 'Completada', true, 181, 'ui'),
  ('admin.sessions.status.canceled_with_refund', 'Canceled (with refund)', 'Cancelada (con reembolso)', 'Cancelada (con reembolso)', true, 182, 'ui'),
  ('admin.sessions.status.canceled_without_refund', 'Canceled (without refund)', 'Cancelada (sin reembolso)', 'Cancelada (sin reembolso)', true, 183, 'ui'),

  -- Media
  ('admin.media.title', 'Media', 'Medios', 'Medios', true, 200, 'ui'),
  ('admin.media.empty', 'No media yet.', 'Aún no hay medios.', 'Aún no hay medios.', true, 201, 'ui'),
  ('admin.media.actions.add', 'Add Media', 'Agregar medio', 'Agregar medio', true, 202, 'ui'),
  ('admin.media.actions.edit', 'Edit', 'Editar', 'Editar', true, 203, 'ui'),
  ('admin.media.actions.open', 'Open', 'Abrir', 'Abrir', true, 204, 'ui'),

  ('admin.media.dialog.addTitle', 'Add Media', 'Agregar medio', 'Agregar medio', true, 205, 'ui'),
  ('admin.media.dialog.editTitle', 'Edit Media', 'Editar medio', 'Editar medio', true, 206, 'ui'),

  ('admin.media.errors.loadFailed', 'Load failed', 'Error al cargar', 'Error al cargar', true, 210, 'ui'),
  ('admin.media.errors.saveFailed', 'Save failed', 'Error al guardar', 'Error al guardar', true, 211, 'ui'),
  ('admin.media.errors.previewFailed', 'Preview failed', 'Error en la vista previa', 'Error en la vista previa', true, 212, 'ui'),

  ('admin.media.fields.assetKey', 'Asset Key (stable pointer)', 'Clave de recurso (puntero estable)', 'Clave de recurso (puntero estable)', true, 220, 'ui'),
  ('admin.media.fields.assetKeyHelp', 'Example: home.hero or home.photo_stream.001', 'Ejemplo: home.hero o home.photo_stream.001', 'Ejemplo: home.hero o home.photo_stream.001', true, 221, 'ui'),
  ('admin.media.fields.title', 'Title', 'Título', 'Título', true, 222, 'ui'),
  ('admin.media.fields.description', 'Description', 'Descripción', 'Descripción', true, 223, 'ui'),
  ('admin.media.fields.bucket', 'Bucket', 'Bucket', 'Bucket', true, 224, 'ui'),
  ('admin.media.fields.path', 'Path', 'Ruta', 'Ruta', true, 225, 'ui'),
  ('admin.media.fields.category', 'Category', 'Categoría', 'Categoría', true, 226, 'ui'),
  ('admin.media.fields.type', 'Type', 'Tipo', 'Tipo', true, 227, 'ui'),
  ('admin.media.fields.sort', 'Sort', 'Orden', 'Orden', true, 228, 'ui'),
  ('admin.media.fields.sessionId', 'Session ID (optional)', 'ID de sesión (opcional)', 'ID de sesión (opcional)', true, 229, 'ui'),
  ('admin.media.fields.public', 'Public', 'Público', 'Público', true, 230, 'ui'),
  ('admin.media.previewHint', 'Preview uses a signed URL (works for private buckets).', 'La vista previa usa una URL firmada (funciona para buckets privados).', 'La vista previa usa una URL firmada (funciona para buckets privados).', true, 231, 'ui'),

  ('admin.media.table.assetKey', 'Asset Key', 'Clave', 'Clave', true, 240, 'ui'),
  ('admin.media.table.title', 'Title', 'Título', 'Título', true, 241, 'ui'),
  ('admin.media.table.category', 'Category', 'Categoría', 'Categoría', true, 242, 'ui'),
  ('admin.media.table.type', 'Type', 'Tipo', 'Tipo', true, 243, 'ui'),
  ('admin.media.table.public', 'Public', 'Público', 'Público', true, 244, 'ui'),
  ('admin.media.table.bucketPath', 'Bucket / Path', 'Bucket / Ruta', 'Bucket / Ruta', true, 245, 'ui'),
  ('admin.media.table.sort', 'Sort', 'Orden', 'Orden', true, 246, 'ui'),
  ('admin.media.table.preview', 'Preview', 'Vista previa', 'Vista previa', true, 247, 'ui'),
  ('admin.media.table.actions', 'Actions', 'Acciones', 'Acciones', true, 248, 'ui'),

  ('admin.media.category.logo', 'Logo', 'Logo', 'Logo', true, 260, 'ui'),
  ('admin.media.category.hero', 'Hero', 'Portada', 'Portada', true, 261, 'ui'),
  ('admin.media.category.lessons', 'Lessons', 'Lecciones', 'Lecciones', true, 262, 'ui'),
  ('admin.media.category.web_content', 'Web content', 'Contenido web', 'Contenido web', true, 263, 'ui'),
  ('admin.media.category.uncategorized', 'Uncategorized', 'Sin categoría', 'Sin categoría', true, 264, 'ui'),
  ('admin.media.type.photo', 'Photo', 'Foto', 'Foto', true, 265, 'ui'),
  ('admin.media.type.video', 'Video', 'Video', 'Video', true, 266, 'ui'),

  -- Media picker
  ('admin.mediaPicker.title', 'Select Media', 'Seleccionar medio', 'Seleccionar medio', true, 280, 'ui'),
  ('admin.mediaPicker.errors.loadFailed', 'Failed to load media', 'No se pudo cargar el contenido', 'No se pudo cargar el contenido', true, 281, 'ui'),
  ('admin.mediaPicker.errors.selectFirst', 'Select an item first.', 'Selecciona un elemento primero.', 'Selecciona un elemento primero.', true, 282, 'ui'),
  ('admin.mediaPicker.fields.category', 'Category', 'Categoría', 'Categoría', true, 283, 'ui'),
  ('admin.mediaPicker.fields.bucket', 'Bucket', 'Bucket', 'Bucket', true, 284, 'ui'),
  ('admin.mediaPicker.count', '{count} item(s)', '{count} elemento(s)', '{count} elemento(s)', true, 285, 'ui'),
  ('admin.mediaPicker.table.select', 'Select', 'Seleccionar', 'Seleccionar', true, 286, 'ui'),
  ('admin.mediaPicker.table.preview', 'Preview', 'Vista previa', 'Vista previa', true, 287, 'ui'),
  ('admin.mediaPicker.table.assetKey', 'Asset Key', 'Clave', 'Clave', true, 288, 'ui'),
  ('admin.mediaPicker.table.title', 'Title', 'Título', 'Título', true, 289, 'ui'),
  ('admin.mediaPicker.table.category', 'Category', 'Categoría', 'Categoría', true, 290, 'ui'),
  ('admin.mediaPicker.table.bucketPath', 'Bucket / Path', 'Bucket / Ruta', 'Bucket / Ruta', true, 291, 'ui'),
  ('admin.mediaPicker.empty', 'No media matches your filters.', 'No hay medios que coincidan con tus filtros.', 'No hay medios que coincidan con tus filtros.', true, 292, 'ui'),
  ('admin.mediaPicker.actions.select', 'Select', 'Seleccionar', 'Seleccionar', true, 293, 'ui'),

  -- Upload
  ('admin.upload.title', 'Upload Media', 'Subir medios', 'Subir medios', true, 300, 'ui'),
  ('admin.upload.subtitle', 'Upload to Supabase Storage and create matching rows in media_assets.', 'Sube a Supabase Storage y crea filas correspondientes en media_assets.', 'Sube a Supabase Storage y crea filas correspondientes en media_assets.', true, 301, 'ui'),
  ('admin.upload.mode.single', 'Single', 'Individual', 'Individual', true, 302, 'ui'),
  ('admin.upload.mode.bulk', 'Bulk', 'Masivo', 'Masivo', true, 303, 'ui'),

  ('admin.upload.fields.bucket', 'Bucket', 'Bucket', 'Bucket', true, 304, 'ui'),
  ('admin.upload.fields.folder', 'Folder (optional)', 'Carpeta (opcional)', 'Carpeta (opcional)', true, 305, 'ui'),
  ('admin.upload.fields.folderHelp', 'Example: hero_shot or lessons/session_123', 'Ejemplo: hero_shot o lessons/session_123', 'Ejemplo: hero_shot o lessons/session_123', true, 306, 'ui'),
  ('admin.upload.fields.title', 'Title', 'Título', 'Título', true, 307, 'ui'),
  ('admin.upload.fields.assetKey', 'Asset Key (optional)', 'Clave (opcional)', 'Clave (opcional)', true, 308, 'ui'),
  ('admin.upload.fields.assetKeyHelp', 'Stable pointer used by components, e.g. home.hero', 'Puntero estable usado por componentes, p. ej. home.hero', 'Puntero estable usado por componentes, p. ej. home.hero', true, 309, 'ui'),
  ('admin.upload.bulk.hint', 'Bulk titles are derived from the filename and a generated UUID.', 'Los títulos masivos se derivan del nombre del archivo y un UUID generado.', 'Los títulos masivos se derivan del nombre del archivo y un UUID generado.', true, 310, 'ui'),
  ('admin.upload.fields.assetKeyPrefix', 'Asset Key Prefix (optional)', 'Prefijo de clave (opcional)', 'Prefijo de clave (opcional)', true, 311, 'ui'),
  ('admin.upload.fields.assetKeyPrefixHelp', 'If set, keys are auto-generated like prefix.001, prefix.002 (upload order).', 'Si se establece, las claves se generan como prefix.001, prefix.002 (orden de carga).', 'Si se establece, las claves se generan como prefix.001, prefix.002 (orden de carga).', true, 312, 'ui'),
  ('admin.upload.fields.description', 'Description', 'Descripción', 'Descripción', true, 313, 'ui'),
  ('admin.upload.fields.category', 'Category', 'Categoría', 'Categoría', true, 314, 'ui'),
  ('admin.upload.fields.type', 'Type', 'Tipo', 'Tipo', true, 315, 'ui'),
  ('admin.upload.fields.sort', 'Sort', 'Orden', 'Orden', true, 316, 'ui'),
  ('admin.upload.fields.sessionId', 'Session ID (optional)', 'ID de sesión (opcional)', 'ID de sesión (opcional)', true, 317, 'ui'),
  ('admin.upload.fields.publicFlag', 'Public (DB flag)', 'Público (bandera DB)', 'Público (bandera DB)', true, 318, 'ui'),

  ('admin.upload.publicDefault.public', 'Bucket default is public', 'El valor predeterminado del bucket es público', 'El valor predeterminado del bucket es público', true, 319, 'ui'),
  ('admin.upload.publicDefault.private', 'Bucket default is private', 'El valor predeterminado del bucket es privado', 'El valor predeterminado del bucket es privado', true, 320, 'ui'),

  ('admin.upload.fileInput.singleAria', 'Select file for upload', 'Seleccionar archivo para subir', 'Seleccionar archivo para subir', true, 321, 'ui'),
  ('admin.upload.fileInput.singleTitle', 'Select file for upload', 'Seleccionar archivo para subir', 'Seleccionar archivo para subir', true, 322, 'ui'),
  ('admin.upload.fileInput.bulkAria', 'Select files for bulk upload', 'Seleccionar archivos para carga masiva', 'Seleccionar archivos para carga masiva', true, 323, 'ui'),
  ('admin.upload.fileInput.bulkTitle', 'Select files for bulk upload', 'Seleccionar archivos para carga masiva', 'Seleccionar archivos para carga masiva', true, 324, 'ui'),

  ('admin.upload.upload', 'Upload', 'Subir', 'Subir', true, 325, 'ui'),
  ('admin.upload.uploading', 'Uploading…', 'Subiendo…', 'Subiendo…', true, 326, 'ui'),
  ('admin.upload.success', 'Uploaded {count} file(s).', 'Se subieron {count} archivo(s).', 'Se subieron {count} archivo(s).', true, 327, 'ui'),
  ('admin.upload.errors.chooseFile', 'Choose at least one file.', 'Elige al menos un archivo.', 'Elige al menos un archivo.', true, 328, 'ui'),
  ('admin.upload.errors.titleRequiredSingle', 'Title is required for single upload.', 'El título es obligatorio para carga individual.', 'El título es obligatorio para carga individual.', true, 329, 'ui'),
  ('admin.upload.errors.uploadFailed', 'Upload failed', 'La carga falló', 'La carga falló', true, 330, 'ui'),
  ('admin.upload.uploadedTitle', 'Uploaded', 'Subidos', 'Subidos', true, 331, 'ui'),

  ('admin.upload.bucket.Lesson_Photos', 'Lesson Photos', 'Fotos de lecciones', 'Fotos de lecciones', true, 332, 'ui'),
  ('admin.upload.bucket.Private_Photos', 'Private Photos', 'Fotos privadas', 'Fotos privadas', true, 333, 'ui'),

  -- Gallery slots editor
  ('admin.gallerySlots.title', 'Gallery Photos', 'Fotos de galería', 'Fotos de galería', true, 340, 'ui'),
  ('admin.gallerySlots.subtitle', 'Controls which media appears on the Gallery page by writing slot keys under gallery.images.*.', 'Controla qué medios aparecen en la página de Galería escribiendo claves de slot bajo gallery.images.*.', 'Controla qué medios aparecen en la página de Galería escribiendo claves de slot bajo gallery.images.*.', true, 341, 'ui'),
  ('admin.gallerySlots.countLabel', 'How many photos to show', 'Cuántas fotos mostrar', 'Cuántas fotos mostrar', true, 342, 'ui'),
  ('admin.gallerySlots.loadingSlots', 'Loading slots…', 'Cargando slots…', 'Cargando slots…', true, 343, 'ui'),
  ('admin.gallerySlots.noneSelected', 'None selected', 'Ninguno seleccionado', 'Ninguno seleccionado', true, 344, 'ui'),
  ('admin.gallerySlots.actions.choose', 'Choose', 'Elegir', 'Elegir', true, 345, 'ui'),
  ('admin.gallerySlots.actions.clear', 'Clear', 'Quitar', 'Quitar', true, 346, 'ui'),
  ('admin.gallerySlots.errors.loadFailed', 'Failed to load gallery slots', 'No se pudieron cargar los slots de la galería', 'No se pudieron cargar los slots de la galería', true, 347, 'ui'),
  ('admin.gallerySlots.errors.saveCountFailed', 'Failed to save count', 'No se pudo guardar la cantidad', 'No se pudo guardar la cantidad', true, 348, 'ui'),
  ('admin.gallerySlots.errors.updateSlotFailed', 'Failed to update slot', 'No se pudo actualizar el slot', 'No se pudo actualizar el slot', true, 349, 'ui')
on conflict (page_key) do update
set
  body_en = excluded.body_en,
  body_es_draft = excluded.body_es_draft,
  body_es_published = excluded.body_es_published,
  approved = excluded.approved,
  sort = excluded.sort,
  category = excluded.category,
  updated_at = now();
