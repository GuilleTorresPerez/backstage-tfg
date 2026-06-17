# Marco operacional

Fuente oficial determinista: https://www.boe.es/eli/es/rd/2022/05/03/311/dof/spa/xml

Medidas principales: 33.
Submedidas directas: 108.

No se incluyen refuerzos `rN`; se documentan solo medidas principales y submedidas directas.

## `op.pl.1` Análisis de riesgos

**Familia:** Planificación

**Descripción de la fuente:**

Se realizará un análisis de riesgos informal, realizado en lenguaje natural. Es decir, una exposición textual que:

### Submedidas

#### `op.pl.1.1`

Identifique los activos más valiosos del sistema. (Ver op.exp.1).

#### `op.pl.1.2`

Identifique las amenazas más probables.

#### `op.pl.1.3`

Identifique las salvaguardas que protegen de dichas amenazas.

#### `op.pl.1.4`

Identifique los principales riesgos residuales.

## `op.pl.2` Arquitectura de seguridad

**Familia:** Planificación

**Descripción de la fuente:**

La seguridad del sistema será objeto de un planteamiento integral detallando, al menos, los siguientes aspectos:

### Submedidas

#### `op.pl.2.1`

Documentación de las instalaciones, incluyendo áreas y puntos de acceso.

#### `op.pl.2.2`

Documentación del sistema, incluyendo equipos, redes internas y conexiones al exterior, y puntos de acceso al sistema (puestos de trabajo y consolas de administración).

#### `op.pl.2.3`

Esquema de líneas de defensa, incluyendo puntos de interconexión a otros sistemas o a otras redes (en especial, si se trata de internet o redes públicas en general); cortafuegos, DMZ, etc.; y la utilización de tecnologías diferentes para prevenir vulnerabilidades que pudieran perforar simultáneamente varias líneas de defensa.

#### `op.pl.2.4`

Sistema de identificación y autenticación de usuarios, incluyendo el uso de claves concertadas, contraseñas, tarjetas de identificación, biometría, u otras de naturaleza análoga, y el uso de ficheros o directorios para autenticar al usuario y determinar sus derechos de acceso.

## `op.pl.3` Adquisición de nuevos componentes

**Familia:** Planificación

**Descripción de la fuente:**

Se establecerá un proceso formal para planificar la adquisición de nuevos componentes del sistema, proceso que:

### Submedidas

#### `op.pl.3.1`

Atenderá a las conclusiones del análisis de riesgos ([op.pl.1]).

#### `op.pl.3.2`

Será acorde a la arquitectura de seguridad escogida ([op.pl.2]).

#### `op.pl.3.3`

Contemplará las necesidades técnicas, de formación y de financiación, de forma conjunta.

## `op.pl.4` Dimensionamiento / gestión de la capacidad

**Familia:** Planificación

**Descripción de la fuente:**

Con carácter previo a la puesta en explotación, se realizará un estudio que cubrirá los siguientes aspectos:

### Submedidas

#### `op.pl.4.1`

Necesidades de procesamiento.

#### `op.pl.4.2`

Necesidades de almacenamiento de información: durante su procesamiento y durante el periodo que deba retenerse.

#### `op.pl.4.3`

Necesidades de comunicación.

#### `op.pl.4.4`

Necesidades de personal: cantidad y cualificación profesional.

#### `op.pl.4.5`

Necesidades de instalaciones y medios auxiliares.

## `op.pl.5` Componentes certificados

**Familia:** Planificación

**Descripción de la fuente:**

Se utilizará el Catálogo de Productos y Servicios de Seguridad de las Tecnologías de la Información y Comunicación (CPSTIC) del CCN, para seleccionar los productos o servicios suministrados por un tercero que formen parte de la arquitectura de seguridad del sistema y aquellos que se referencien expresamente en las medidas de este real decreto.

En caso de que no existan productos o servicios en el CPSTIC que implementen las funcionalidades requeridas, se utilizarán productos certificados de acuerdo a lo descrito en el artículo 19.

Una Instrucción Técnica de Seguridad detallará los criterios relativos a la adquisición de productos de seguridad.

Si el sistema suministra un servicio de seguridad a un tercero bajo el alcance del ENS, el producto o productos que en los que se sustente dicho servicio debe superar un proceso de cualificación y ser incluido en el CPSTIC, o aportar una certificación que cumpla con los requisitos funcionales de seguridad y de aseguramiento de acuerdo a lo establecido en el artículo 19.

### Submedidas

#### `op.pl.5.1`

Se utilizará el Catálogo de Productos y Servicios de Seguridad de las Tecnologías de la Información y Comunicación (CPSTIC) del CCN, para seleccionar los productos o servicios suministrados por un tercero que formen parte de la arquitectura de seguridad del sistema y aquellos que se referencien expresamente en las medidas de este real decreto.

En caso de que no existan productos o servicios en el CPSTIC que implementen las funcionalidades requeridas, se utilizarán productos certificados de acuerdo a lo descrito en el artículo 19.

Una Instrucción Técnica de Seguridad detallará los criterios relativos a la adquisición de productos de seguridad.

#### `op.pl.5.2`

Si el sistema suministra un servicio de seguridad a un tercero bajo el alcance del ENS, el producto o productos que en los que se sustente dicho servicio debe superar un proceso de cualificación y ser incluido en el CPSTIC, o aportar una certificación que cumpla con los requisitos funcionales de seguridad y de aseguramiento de acuerdo a lo establecido en el artículo 19.

## `op.acc.1` Identificación

**Familia:** Control de acceso

**Descripción de la fuente:**

La identificación de los usuarios del sistema se realizará de acuerdo con lo que se indica a continuación:

### Submedidas

#### `op.acc.1.1`

Se podrá utilizar como identificador único los sistemas de identificación previstos en la normativa de aplicación, entre ellos, los sistemas de clave concertada y cualquier otro sistema que las administraciones consideren válido en los términos y condiciones establecidos en la Ley 39/2015, de 1 de octubre, del Procedimiento Administrativo Común de las Administraciones Públicas.

#### `op.acc.1.2`

Cuando el usuario tenga diferentes roles frente al sistema (como ciudadano o usuario final, como trabajador del organismo o como administrador de los sistemas, por ejemplo) recibirá identificadores singulares para cada perfil, de forma que se recaben siempre los correspondientes registros de actividad, delimitándose los privilegios correspondientes a cada perfil.

#### `op.acc.1.3`

Cada entidad (entidad, usuario o proceso) que accede al sistema, contará con un identificador singular que permita conocer el destinatario de los mismos y los derechos de acceso que recibe, así como las acciones realizadas por cada entidad.

#### `op.acc.1.4`

Las cuentas de usuario se gestionarán de la siguiente forma:

a) Cada cuenta (de entidad, usuario o proceso) estará asociada a un identificador único.

b) Las cuentas deben ser inhabilitadas en los siguientes casos: cuando el usuario deja la organización; cuando el usuario cesa en la función para la cual se requería la cuenta de usuario; o, cuando la persona que la autorizó da orden en sentido contrario.

c) Las cuentas se retendrán durante el periodo necesario para atender a las necesidades de trazabilidad de los registros de actividad asociados a las mismas. A este periodo se le denominará «periodo de retención».

#### `op.acc.1.5`

En los supuestos de comunicaciones electrónicas, las partes intervinientes se identificarán atendiendo a los mecanismos previstos en la legislación europea y nacional en la materia, con la siguiente correspondencia entre los niveles de la dimensión de autenticidad de los sistemas de información a los que se tiene acceso y los niveles de seguridad (bajo, sustancial, alto) de los sistemas de identificación electrónica previstos en el Reglamento (UE) n.º 910/2014, del Parlamento Europeo y del Consejo, de 23 de julio de 2014, relativo a la identificación electrónica y los servicios de confianza para las transacciones electrónicas en el mercado interior y por el que se deroga la Directiva 1999/93/CE y sus normas de desarrollo o ejecución que resulten de aplicación:

a) Si se requiere un nivel BAJO en la dimensión de autenticidad (anexo I): Nivel de seguridad bajo, sustancial o alto (artículo 8 del Reglamento (UE) n.º 910/2014).

b) Si se requiere un nivel MEDIO en la dimensión de autenticidad (anexo I): Nivel de seguridad sustancial o alto (artículo 8 del Reglamento (UE) n.º 910/2014).

c) Si se requiere un nivel ALTO en la dimensión de autenticidad (anexo I): Nivel de seguridad alto (artículo 8 del Reglamento (UE) n.º 910/2014).

## `op.acc.2` Requisitos de acceso

**Familia:** Control de acceso

**Descripción de la fuente:**

Los recursos del sistema se protegerán con algún mecanismo que impida su utilización, salvo a las entidades que disfruten de derechos de acceso suficientes.

Los derechos de acceso de cada recurso, se establecerán según las decisiones de la persona responsable del recurso, ateniéndose a la política y normativa de seguridad del sistema.

Particularmente, se controlará el acceso a los componentes del sistema operativo y a sus ficheros o registros de configuración.

### Submedidas

#### `op.acc.2.1`

Los recursos del sistema se protegerán con algún mecanismo que impida su utilización, salvo a las entidades que disfruten de derechos de acceso suficientes.

#### `op.acc.2.2`

Los derechos de acceso de cada recurso, se establecerán según las decisiones de la persona responsable del recurso, ateniéndose a la política y normativa de seguridad del sistema.

#### `op.acc.2.3`

Particularmente, se controlará el acceso a los componentes del sistema operativo y a sus ficheros o registros de configuración.

## `op.acc.3` Segregación de funciones y tareas

**Familia:** Control de acceso

**Descripción de la fuente:**

El sistema de control de acceso se organizará de forma que se exija la concurrencia de dos o más personas para realizar tareas críticas, anulando la posibilidad de que un solo individuo autorizado pueda abusar de sus derechos para cometer alguna acción ilícita o no autorizada.

### Submedidas

#### `op.acc.3.1`

Siempre que sea posible, las capacidades de desarrollo y operación no recaerán en la misma persona.

#### `op.acc.3.2`

Siempre que sea posible, las personas que autorizan y controlan el uso serán distintas.

## `op.acc.4` Proceso de gestión de derechos de acceso

**Familia:** Control de acceso

**Descripción de la fuente:**

Los derechos de acceso de cada entidad, usuario o proceso se limitarán atendiendo a los siguientes principios:

### Submedidas

#### `op.acc.4.1`

Todo acceso estará prohibido, salvo autorización expresa.

#### `op.acc.4.2`

Mínimo privilegio: los privilegios de cada entidad, usuario o proceso se reducirán al mínimo imprescindible para cumplir sus obligaciones o funciones.

#### `op.acc.4.3`

Necesidad de conocer y responsabilidad de compartir: los privilegios se asignarán de forma que las entidades, usuarios o procesos sólo accederán al conocimiento de aquella información requerida para cumplir sus obligaciones o funciones. La información es patrimonio del organismo y toda aquella que resulte necesaria para el usuario estará a su disposición.

#### `op.acc.4.4`

Capacidad de autorizar: Exclusivamente el personal con competencia para ello podrá conceder, alterar o anular la autorización de acceso a los recursos, conforme a los criterios establecidos por su responsable. Los permisos de acceso se revisarán de forma periódica.

#### `op.acc.4.5`

Se establecerá una política específica de acceso remoto, requiriéndose autorización expresa.

## `op.acc.5` Mecanismo de autenticación (usuarios externos)

**Familia:** Control de acceso

**Descripción de la fuente:**

Referente a usuarios que no son usuarios de la organización.

Las guías CCN-STIC desarrollarán los mecanismos y calidades exigibles a cada tipo de factor de autenticación en función de los niveles de seguridad requeridos por el sistema de información el que se accede y los privilegios concedidos al usuario.

### Submedidas

#### `op.acc.5.1`

Antes de proporcionar las credenciales de autenticación a las entidades, usuarios o procesos, estos deberán haberse identificado y registrado de manera fidedigna ante el sistema o ante un Prestador Cualificado de Servicios de Confianza o un proveedor de identidad electrónica reconocido por las administraciones públicas, de conformidad con lo dispuesto en la Ley 39/2015, de 1 de octubre.

#### `op.acc.5.2`

Antes de activar el mecanismo de autenticación, el usuario reconocerá que las ha recibido y que conoce y acepta las obligaciones que implica su tenencia, en particular, el deber de custodia diligente, la protección de su confidencialidad y el deber de notificación inmediata en caso de pérdida.

#### `op.acc.5.3`

Las credenciales estarán bajo el control exclusivo del usuario y se activarán una vez estén bajo su control efectivo.

#### `op.acc.5.4`

Las credenciales se cambiarán con una periodicidad marcada por la política de seguridad de la organización.

#### `op.acc.5.5`

Las credenciales serán inhabilitadas -pudiendo ser regeneradas, en su caso-, cuando conste o se sospeche su pérdida, compromiso o revelación a entidades (personas, equipos o procesos) no autorizadas.

#### `op.acc.5.6`

Las credenciales serán inhabilitadas cuando la entidad (persona, equipo o proceso) que autentican termina su relación con el sistema.

#### `op.acc.5.7`

Antes de autorizar el acceso, la información presentada por el sistema será la mínima imprescindible para que el usuario se autentique, evitando todo aquello que pueda, directa o indirectamente, revelar información sobre el sistema o la cuenta, sus características, su operación o su estado. Las credenciales solamente se validarán cuando se tengan todos los datos necesarios y, si se rechaza, no se informará del motivo del rechazo.

#### `op.acc.5.8`

El número de intentos permitidos será limitado, bloqueando la oportunidad de acceso una vez superado tal número, y requiriendo una intervención específica para reactivar la cuenta, que se describirá en la documentación.

#### `op.acc.5.9`

El sistema informará al usuario de sus derechos u obligaciones inmediatamente después de obtener el acceso.

## `op.acc.6` Mecanismo de autenticación (usuarios de la organización)

**Familia:** Control de acceso

**Descripción de la fuente:**

Esta medida se refiere a personal del organismo, propio o contratado, estable o circunstancial, que pueda tener acceso a información contenida en el sistema.

Las guías CCN-STIC desarrollarán los mecanismos y calidades exigibles a cada tipo de factor de autenticación, en función de los niveles de seguridad requeridos por el sistema de información el que se accede y los privilegios concedidos al usuario.

### Submedidas

#### `op.acc.6.1`

Antes de proporcionar las credenciales a los usuarios, estos deberán conocer y aceptar la política de seguridad del organismo en los aspectos que les afecten.

#### `op.acc.6.2`

Antes de activar el mecanismo de autenticación, el usuario reconocerá que ha recibido las credenciales de acceso y que conoce y acepta las obligaciones que implica su tenencia, en particular, el deber de custodia diligente, la protección de su confidencialidad y el deber de notificación inmediata en caso de pérdida.

#### `op.acc.6.3`

Las credenciales estarán bajo el control exclusivo del usuario y se activarán una vez estén bajo su control efectivo.

#### `op.acc.6.4`

Las credenciales se cambiarán con una periodicidad marcada por la política de seguridad de la organización.

#### `op.acc.6.5`

Las credenciales serán inhabilitadas -pudiendo ser regeneradas, en su caso-, cuando conste o se sospeche su pérdida, compromiso o revelación a entidades (personas, equipos o procesos) no autorizadas.

#### `op.acc.6.6`

Las credenciales serán inhabilitadas cuando el usuario que autentican termina su relación con el sistema.

#### `op.acc.6.7`

Antes de autorizar el acceso, la información presentada por el sistema será la mínima imprescindible para que el usuario se autentique, evitando todo aquello que pueda, directa o indirectamente, revelar información sobre el sistema o la cuenta, sus características, su operación o su estado. Las credenciales solamente se validarán cuando se tengan todos los datos necesarios y, si se rechaza, no se informará del motivo del rechazo.

#### `op.acc.6.8`

El número de intentos permitidos será limitado, bloqueando la oportunidad de acceso una vez superado tal número, y requiriendo una intervención específica para reactivar la cuenta, que se describirá en la documentación.

#### `op.acc.6.9`

El sistema informará al usuario de sus derechos u obligaciones inmediatamente después de obtener el acceso.

## `op.exp.1` Inventario de activos

**Familia:** Explotación

**Descripción de la fuente:**

Se mantendrá un inventario actualizado de todos los elementos del sistema, detallando su naturaleza e identificando a su responsable; es decir, la persona que toma las decisiones relativas al mismo.

### Submedidas

#### `op.exp.1.1`

Se mantendrá un inventario actualizado de todos los elementos del sistema, detallando su naturaleza e identificando a su responsable; es decir, la persona que toma las decisiones relativas al mismo.

## `op.exp.2` Configuración de seguridad

**Familia:** Explotación

**Descripción de la fuente:**

Se configurarán los equipos previamente a su entrada en operación, de forma que:

### Submedidas

#### `op.exp.2.1`

Se retiren cuentas y contraseñas estándar.

#### `op.exp.2.2`

Se aplicará la regla de «mínima funcionalidad», es decir:

a) El sistema debe proporcionar la funcionalidad mínima imprescindible para que la organización alcance sus objetivos.

b) No proporcionará funciones injustificadas (de operación, administración o auditoría) al objeto de reducir al mínimo su perímetro de exposición, eliminándose o desactivándose aquellas funciones que sean innecesarias o inadecuadas al fin que se persigue.

#### `op.exp.2.3`

Se aplicará la regla de «seguridad por defecto», es decir:

a) Las medidas de seguridad serán respetuosas con el usuario y protegerán a éste, salvo que se exponga conscientemente a un riesgo.

b) Para reducir la seguridad, el usuario tendrá que realizar acciones conscientes.

c) El uso natural, en los casos que el usuario no ha consultado el manual, será un uso seguro.

#### `op.exp.2.4`

Las máquinas virtuales estarán configuradas y gestionadas de un modo seguro. La gestión del parcheado, cuentas de usuarios, software antivirus, etc. se realizará como si se tratara de máquinas físicas, incluyendo la máquina anfitriona.

## `op.exp.3` Gestión de la configuración de seguridad

**Familia:** Explotación

**Descripción de la fuente:**

Se gestionará de forma continua la configuración de los componentes del sistema, de forma que:

### Submedidas

#### `op.exp.3.1`

Se mantenga en todo momento la regla de "funcionalidad mínima" ([op.exp.2]).

#### `op.exp.3.2`

Se mantenga en todo momento la regla de "mínimo privilegio" ([op.exp.2]).

#### `op.exp.3.3`

El sistema se adapte a las nuevas necesidades, previamente autorizadas. (Ver [op.acc.4]).

#### `op.exp.3.4`

El sistema reaccione a vulnerabilidades notificadas. (Ver [op.exp.4]).

#### `op.exp.3.5`

El sistema reaccione a incidentes. (Ver [op.exp.7]).

#### `op.exp.3.6`

La configuración de seguridad solamente podrá editarse por personal debidamente autorizado.

## `op.exp.4` Mantenimiento y actualizaciones de seguridad

**Familia:** Explotación

**Descripción de la fuente:**

Para mantener el equipamiento físico y lógico que constituye el sistema, se aplicará lo siguiente:

### Submedidas

#### `op.exp.4.1`

Se atenderá a las especificaciones de los fabricantes en lo relativo a instalación y mantenimiento de los sistemas, lo que incluirá un seguimiento continuo de los anuncios de defectos.

#### `op.exp.4.2`

Se dispondrá de un procedimiento para analizar, priorizar y determinar cuándo aplicar las actualizaciones de seguridad, parches, mejoras y nuevas versiones. La priorización tendrá en cuenta la variación del riesgo en función de la implantación o no de la actualización.

#### `op.exp.4.3`

El mantenimiento solo podrá realizarse por personal debidamente autorizado.

## `op.exp.5` Gestión de cambios

**Familia:** Explotación

**Descripción de la fuente:**

Se mantendrá un control continuo de los cambios realizados en el sistema, de forma que:

### Submedidas

#### `op.exp.5.1`

Los cambios se planificarán para reducir el impacto sobre la prestación de los servicios afectados. Para ello, todas las peticiones de cambio se registrarán asignando un número de referencia que permita su seguimiento, de forma equivalente al registro de los incidentes.

#### `op.exp.5.2`

La información a registrar para cada petición de cambio será suficiente para que quien deba autorizarlos no tenga dudas al respecto y permita gestionarlo hasta su desestimación o implementación.

#### `op.exp.5.3`

Las pruebas de preproducción, siempre que sea posible realizarlas, se efectuarán en equipos equivalentes a los de producción, al menos en los aspectos específicos del cambio.

#### `op.exp.5.4`

Mediante un análisis de riesgos se determinará si los cambios son relevantes para la seguridad del sistema. Aquellos cambios que impliquen un riesgo de nivel ALTO deberán ser aprobados, explícitamente, de forma previa a su implantación, por el Responsable de la Seguridad.

#### `op.exp.5.5`

Una vez implementado el cambio, se realizarán las pruebas de aceptación convenientes. Si son positivas, se actualizará la documentación de configuración (diagramas de red, manuales, el inventario, etc.), siempre que proceda.

## `op.exp.6` Protección frente a código dañino

**Familia:** Explotación

**Descripción de la fuente:**

Se dispondrá de mecanismos de prevención y reacción frente a código dañino, incluyendo el correspondiente mantenimiento de acuerdo a las recomendaciones del fabricante.

Se instalará software de protección frente a código dañino en todos los equipos: puestos de usuario, servidores y elementos perimetrales.

Todo fichero procedente de fuentes externas será analizado antes de trabajar con él.

Las bases de datos de detección de código dañino permanecerán permanentemente actualizadas.

El software de detección de código dañino instalado en los puestos de usuario deberá estar configurado de forma adecuada e implementará protección en tiempo real de acuerdo a las recomendaciones del fabricante.

### Submedidas

#### `op.exp.6.1`

Se dispondrá de mecanismos de prevención y reacción frente a código dañino, incluyendo el correspondiente mantenimiento de acuerdo a las recomendaciones del fabricante.

#### `op.exp.6.2`

Se instalará software de protección frente a código dañino en todos los equipos: puestos de usuario, servidores y elementos perimetrales.

#### `op.exp.6.3`

Todo fichero procedente de fuentes externas será analizado antes de trabajar con él.

#### `op.exp.6.4`

Las bases de datos de detección de código dañino permanecerán permanentemente actualizadas.

#### `op.exp.6.5`

El software de detección de código dañino instalado en los puestos de usuario deberá estar configurado de forma adecuada e implementará protección en tiempo real de acuerdo a las recomendaciones del fabricante.

## `op.exp.7` Gestión de incidentes

**Familia:** Explotación

**Descripción de la fuente:**

Se dispondrá de un proceso integral para hacer frente a los incidentes que puedan tener un impacto en la seguridad del sistema, que incluya el informe de eventos de seguridad y debilidades, detallando los criterios de clasificación y el escalado de la notificación.

La gestión de incidentes que afecten a datos personales tendrá en cuenta lo dispuesto en el Reglamento General de Protección de Datos; la Ley Orgánica 3/2018, de 5 de diciembre, en especial su disposición adicional primera, así como el resto de normativa de aplicación, sin perjuicio de los requisitos establecidos en este real decreto.

### Submedidas

#### `op.exp.7.1`

Se dispondrá de un proceso integral para hacer frente a los incidentes que puedan tener un impacto en la seguridad del sistema, que incluya el informe de eventos de seguridad y debilidades, detallando los criterios de clasificación y el escalado de la notificación.

#### `op.exp.7.2`

La gestión de incidentes que afecten a datos personales tendrá en cuenta lo dispuesto en el Reglamento General de Protección de Datos; la Ley Orgánica 3/2018, de 5 de diciembre, en especial su disposición adicional primera, así como el resto de normativa de aplicación, sin perjuicio de los requisitos establecidos en este real decreto.

## `op.exp.8` Registro de la actividad

**Familia:** Explotación

**Descripción de la fuente:**

Se registrarán las actividades en el sistema, de forma que:

### Submedidas

#### `op.exp.8.1`

Se generará un registro de auditoría, que incluirá, al menos, el identificador del usuario o entidad asociado al evento, fecha y hora, sobre qué información se realiza el evento, tipo de evento y el resultado del evento (fallo o éxito), según la política de seguridad y los procedimientos asociados a la misma.

#### `op.exp.8.2`

Se activarán los registros de actividad en los servidores.

## `op.exp.9` Registro de la gestión de incidentes

**Familia:** Explotación

**Descripción de la fuente:**

Se registrarán todas las actuaciones relacionadas con la gestión de incidentes, de forma que:

### Submedidas

#### `op.exp.9.1`

Se registrarán los reportes iniciales, intermedios y finales de los incidentes, las actuaciones de emergencia y las modificaciones del sistema derivadas del incidente.

#### `op.exp.9.2`

Se registrará aquella evidencia que pueda dirimirse en un ámbito jurisdiccional, especialmente cuando el incidente pueda comportar acciones disciplinarias sobre el personal interno, sobre proveedores externos o en la persecución de delitos. En la determinación de la composición y detalle de estas evidencias, se recurrirá a asesoramiento legal especializado.

#### `op.exp.9.3`

Como consecuencia del análisis de los incidentes, se revisará la determinación de los eventos auditables.

## `op.exp.10` Protección de claves criptográficas

**Familia:** Explotación

**Descripción de la fuente:**

Las claves criptográficas se protegerán durante todo su ciclo de vida: (1) generación, (2) transporte al punto de explotación, (3) custodia durante la explotación, (4) archivo posterior a su retirada de explotación activa y (5) destrucción final.

Los medios de generación estarán aislados de los medios de explotación.

Las claves retiradas de operación que deban ser archivadas, lo serán en medios aislados de los de explotación.

### Submedidas

#### `op.exp.10.1`

Las claves criptográficas se protegerán durante todo su ciclo de vida: (1) generación, (2) transporte al punto de explotación, (3) custodia durante la explotación, (4) archivo posterior a su retirada de explotación activa y (5) destrucción final.

#### `op.exp.10.2`

Los medios de generación estarán aislados de los medios de explotación.

#### `op.exp.10.3`

Las claves retiradas de operación que deban ser archivadas, lo serán en medios aislados de los de explotación.

## `op.ext.1` Contratación y acuerdos de nivel de servicio

**Familia:** Recursos externos

**Descripción de la fuente:**

Con anterioridad a la efectiva utilización de los recursos externos se establecerá contractualmente un Acuerdo de Nivel de Servicio, que incluirá las características del servicio prestado, lo que debe entenderse como «servicio mínimo admisible», así como, la responsabilidad del prestador y las consecuencias de eventuales incumplimientos.

### Submedidas

#### `op.ext.1.1`

Con anterioridad a la efectiva utilización de los recursos externos se establecerá contractualmente un Acuerdo de Nivel de Servicio, que incluirá las características del servicio prestado, lo que debe entenderse como «servicio mínimo admisible», así como, la responsabilidad del prestador y las consecuencias de eventuales incumplimientos.

## `op.ext.2` Gestión diaria

**Familia:** Recursos externos

**Descripción de la fuente:**

Se establecerá lo siguiente:

### Submedidas

#### `op.ext.2.1`

Un sistema rutinario para medir el cumplimiento de las obligaciones de servicio, incluyendo el procedimiento para neutralizar cualquier desviación fuera del margen de tolerancia acordado ([op.ext.1]).

#### `op.ext.2.2`

El mecanismo y los procedimientos de coordinación para llevar a cabo las tareas de mantenimiento de los sistemas comprendidos en el acuerdo, que contemplarán los supuestos de incidentes y desastres (ver [op.exp.7]).

## `op.ext.3` Protección de la cadena de suministro

**Familia:** Recursos externos

**Descripción de la fuente:**

Se analizará el impacto que puede tener sobre el sistema un incidente accidental o deliberado que tenga su origen en la cadena de suministro.

Se estimará el riesgo sobre el sistema por causa del impacto estimado en el punto anterior.

Se tomarán medidas de contención de los impactos estimados en los puntos anteriores.

### Submedidas

#### `op.ext.3.1`

Se analizará el impacto que puede tener sobre el sistema un incidente accidental o deliberado que tenga su origen en la cadena de suministro.

#### `op.ext.3.2`

Se estimará el riesgo sobre el sistema por causa del impacto estimado en el punto anterior.

#### `op.ext.3.3`

Se tomarán medidas de contención de los impactos estimados en los puntos anteriores.

## `op.ext.4` Interconexión de sistemas

**Familia:** Recursos externos

**Descripción de la fuente:**

Se denomina interconexión al establecimiento de enlaces con otros sistemas de información para el intercambio de información y servicios.

### Submedidas

#### `op.ext.4.1`

Todos los intercambios de información y prestación de servicios con otros sistemas deberán ser objeto de una autorización previa. Todo flujo de información estará prohibido salvo autorización expresa.

#### `op.ext.4.2`

Para cada interconexión se documentará explícitamente: las características de la interfaz, los requisitos de seguridad y protección de datos y la naturaleza de la información intercambiada.

## `op.nub.1` Protección de servicios en la nube

**Familia:** Servicios en la nube

**Descripción de la fuente:**

Los sistemas que suministran un servicio en la nube a organismos del sector público deberán cumplir con el conjunto de medidas de seguridad en función del modelo de servicio en la nube que presten: Software como Servicio (Software as a Service, SaaS), Plataforma como Servicio (Platform as a Service, PaaS) e Infraestructura como Servicio (Infrastructure as a Service, IaaS) definidas en las guías CCN-STIC que sean de aplicación.

Cuando se utilicen servicios en la nube suministrados por terceros, los sistemas de información que los soportan deberán ser conformes con el ENS o cumplir con las medidas desarrolladas en una guía CCN-STIC que incluirá, entre otros, requisitos relativos a:

a) Auditoría de pruebas de penetración (pentesting).

b) Transparencia.

c) Cifrado y gestión de claves.

d) Jurisdicción de los datos.

### Submedidas

#### `op.nub.1.1`

Los sistemas que suministran un servicio en la nube a organismos del sector público deberán cumplir con el conjunto de medidas de seguridad en función del modelo de servicio en la nube que presten: Software como Servicio (Software as a Service, SaaS), Plataforma como Servicio (Platform as a Service, PaaS) e Infraestructura como Servicio (Infrastructure as a Service, IaaS) definidas en las guías CCN-STIC que sean de aplicación.

#### `op.nub.1.2`

Cuando se utilicen servicios en la nube suministrados por terceros, los sistemas de información que los soportan deberán ser conformes con el ENS o cumplir con las medidas desarrolladas en una guía CCN-STIC que incluirá, entre otros, requisitos relativos a:

a) Auditoría de pruebas de penetración (pentesting).

b) Transparencia.

c) Cifrado y gestión de claves.

d) Jurisdicción de los datos.

## `op.cont.1` Análisis de impacto

**Familia:** Continuidad del servicio

**Descripción de la fuente:**

Se realizará un análisis de impacto que permita determinar los requisitos de disponibilidad de cada servicio (impacto de una interrupción durante un periodo de tiempo determinado), así como los elementos que son críticos para la prestación de cada servicio.

### Submedidas

#### `op.cont.1.1`

Se realizará un análisis de impacto que permita determinar los requisitos de disponibilidad de cada servicio (impacto de una interrupción durante un periodo de tiempo determinado), así como los elementos que son críticos para la prestación de cada servicio.

## `op.cont.2` Plan de continuidad

**Familia:** Continuidad del servicio

**Descripción de la fuente:**

Se desarrollará un plan de continuidad que establezca las acciones a ejecutar en caso de interrupción de los servicios prestados con los medios habituales. Dicho plan contemplará los siguientes aspectos:

### Submedidas

#### `op.cont.2.1`

Se identificarán funciones, responsabilidades y actividades a realizar.

#### `op.cont.2.2`

Existirá una previsión para coordinar la entrada en servicio de los medios alternativos de forma que se garantice poder seguir prestando los servicios esenciales de la organización.

#### `op.cont.2.3`

Todos los medios alternativos estarán planificados y materializados en acuerdos o contratos con los proveedores correspondientes.

#### `op.cont.2.4`

Las personas afectadas por el plan recibirán formación específica relativa a su papel en dicho plan.

#### `op.cont.2.5`

El plan de continuidad será parte integral y armónica de los planes de continuidad de la organización en otras materias ajenas a la seguridad.

## `op.cont.3` Pruebas periódicas

**Familia:** Continuidad del servicio

**Descripción de la fuente:**

Se realizarán pruebas periódicas para localizar y, en su caso, corregir los errores o deficiencias que puedan existir en el plan de continuidad.

### Submedidas

#### `op.cont.3.1`

Se realizarán pruebas periódicas para localizar y, en su caso, corregir los errores o deficiencias que puedan existir en el plan de continuidad.

## `op.cont.4` Medios alternativos

**Familia:** Continuidad del servicio

**Descripción de la fuente:**

Estará prevista la disponibilidad de medios alternativos para poder seguir prestando servicio cuando los medios habituales no estén disponibles. En concreto, se cubrirán los siguientes elementos del sistema:

a) Servicios contratados a terceros.

b) Instalaciones alternativas.

c) Personal alternativo.

d) Equipamiento informático alternativo.

e) Medios de comunicación alternativos.

Se establecerá un tiempo máximo para que los medios alternativos entren en funcionamiento.

Los medios alternativos estarán sometidos a las mismas garantías de seguridad que los originales.

### Submedidas

#### `op.cont.4.1`

Estará prevista la disponibilidad de medios alternativos para poder seguir prestando servicio cuando los medios habituales no estén disponibles. En concreto, se cubrirán los siguientes elementos del sistema:

a) Servicios contratados a terceros.

b) Instalaciones alternativas.

c) Personal alternativo.

d) Equipamiento informático alternativo.

e) Medios de comunicación alternativos.

#### `op.cont.4.2`

Se establecerá un tiempo máximo para que los medios alternativos entren en funcionamiento.

#### `op.cont.4.3`

Los medios alternativos estarán sometidos a las mismas garantías de seguridad que los originales.

## `op.mon.1` Detección de intrusión

**Familia:** Monitorización del sistema

**Descripción de la fuente:**

Se dispondrá de herramientas de detección o prevención de intrusiones.

### Submedidas

#### `op.mon.1.1`

Se dispondrá de herramientas de detección o prevención de intrusiones.

## `op.mon.2` Sistema de métricas

**Familia:** Monitorización del sistema

**Descripción de la fuente:**

Atendiendo a la categoría de seguridad del sistema, se recopilarán los datos necesarios para conocer el grado de implantación de las medidas de seguridad que resulten aplicables y, en su caso, para proveer el informe anual requerido por el artículo 32.

### Submedidas

#### `op.mon.2.1`

Atendiendo a la categoría de seguridad del sistema, se recopilarán los datos necesarios para conocer el grado de implantación de las medidas de seguridad que resulten aplicables y, en su caso, para proveer el informe anual requerido por el artículo 32.

## `op.mon.3` Vigilancia

**Familia:** Monitorización del sistema

**Descripción de la fuente:**

Se dispondrá de un sistema automático de recolección de eventos de seguridad.

### Submedidas

#### `op.mon.3.1`

Se dispondrá de un sistema automático de recolección de eventos de seguridad.
