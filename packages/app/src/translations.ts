import { createTranslationMessages } from '@backstage/core-plugin-api/alpha';
import { catalogTranslationRef } from '@backstage/plugin-catalog/alpha';
import { catalogReactTranslationRef } from '@backstage/plugin-catalog-react/alpha';
import { coreComponentsTranslationRef } from '@backstage/core-components/alpha';
import { userSettingsTranslationRef } from '@backstage/plugin-user-settings/alpha';
import { searchTranslationRef } from '@backstage/plugin-search/alpha';
import { notificationsTranslationRef } from '@backstage/plugin-notifications/alpha';
import { orgTranslationRef } from '@backstage/plugin-org/alpha';

const catalogEs = createTranslationMessages({
  ref: catalogTranslationRef,
  messages: {
    'indexPage.title': 'Catálogo de {{orgName}}',
    'indexPage.createButtonTitle': 'Crear',
    'indexPage.supportButtonContent':
      'Todas tus entidades del catálogo de software',
    'entityPage.notFoundMessage':
      'No existe ningún {{kind}} con el {{link}} solicitado.',
    'entityPage.notFoundLinkText': 'tipo, espacio de nombres y nombre',
    'aboutCard.title': 'Acerca de',
    'aboutCard.refreshButtonTitle': 'Programar actualización de la entidad',
    'aboutCard.editButtonTitle': 'Editar metadatos',
    'aboutCard.editButtonAriaLabel': 'Editar',
    'aboutCard.createSimilarButtonTitle': 'Crear algo similar',
    'aboutCard.refreshScheduledMessage': 'Actualización programada',
    'aboutCard.refreshButtonAriaLabel': 'Actualizar',
    'aboutCard.launchTemplate': 'Lanzar plantilla',
    'aboutCard.viewTechdocs': 'Ver TechDocs',
    'aboutCard.viewSource': 'Ver código fuente',
    'aboutCard.unknown': 'desconocido',
    'aboutCard.descriptionField.label': 'Descripción',
    'aboutCard.descriptionField.value': 'Sin descripción',
    'aboutCard.ownerField.label': 'Propietario',
    'aboutCard.ownerField.value': 'Sin propietario',
    'aboutCard.domainField.label': 'Dominio',
    'aboutCard.domainField.value': 'Sin dominio',
    'aboutCard.systemField.label': 'Sistema',
    'aboutCard.systemField.value': 'Sin sistema',
    'aboutCard.parentComponentField.label': 'Componente padre',
    'aboutCard.parentComponentField.value': 'Sin componente padre',
    'aboutCard.typeField.label': 'Tipo',
    'aboutCard.lifecycleField.label': 'Lifecycle',
    'aboutCard.tagsField.label': 'Etiquetas',
    'aboutCard.tagsField.value': 'Sin etiquetas',
    'aboutCard.targetsField.label': 'Destinos',
    'searchResultItem.kind': 'Clase',
    'searchResultItem.type': 'Tipo',
    'searchResultItem.lifecycle': 'Lifecycle',
    'searchResultItem.owner': 'Propietario',
    'catalogTable.warningPanelTitle':
      'No se pudieron obtener las entidades del catálogo.',
    'catalogTable.viewActionTitle': 'Ver',
    'catalogTable.editActionTitle': 'Editar',
    'catalogTable.starActionTitle': 'Añadir a favoritos',
    'catalogTable.unStarActionTitle': 'Quitar de favoritos',
    'catalogTable.allFilters': 'Todos',
    'dependencyOfComponentsCard.title': 'Dependencia de componentes',
    'dependencyOfComponentsCard.emptyMessage':
      'Ningún componente depende de este componente',
    'dependsOnComponentsCard.title': 'Depende de componentes',
    'dependsOnComponentsCard.emptyMessage':
      'Ningún componente es dependencia de este componente',
    'dependsOnResourcesCard.title': 'Depende de recursos',
    'dependsOnResourcesCard.emptyMessage':
      'Ningún recurso es dependencia de este componente',
    'entityContextMenu.copiedMessage': '¡Copiado!',
    'entityContextMenu.moreButtonTitle': 'Más',
    'entityContextMenu.inspectMenuTitle': 'Inspeccionar entidad',
    'entityContextMenu.copyURLMenuTitle': 'Copiar URL de la entidad',
    'entityContextMenu.unregisterMenuTitle': 'Eliminar entidad',
    'entityContextMenu.moreButtonAriaLabel': 'más',
    'entityLabelsCard.title': 'Etiquetas',
    'entityLabelsCard.emptyDescription':
      'No hay etiquetas definidas para esta entidad. Puedes añadirlas al YAML de la entidad como en el ejemplo destacado:',
    'entityLabelsCard.readMoreButtonTitle': 'Leer más',
    'entityLabels.warningPanelTitle': 'Entidad no encontrada',
    'entityLabels.ownerLabel': 'Propietario',
    'entityLabels.lifecycleLabel': 'Lifecycle',
    'entityLinksCard.title': 'Enlaces',
    'entityLinksCard.emptyDescription':
      'No hay enlaces definidos para esta entidad. Puedes añadirlos al YAML de la entidad como en el ejemplo destacado:',
    'entityLinksCard.readMoreButtonTitle': 'Leer más',
    'entityNotFound.title': 'No se encontró la entidad',
    'entityNotFound.description':
      '¿Quieres ayudarnos a construir esto? Consulta nuestra documentación de Primeros Pasos.',
    'entityNotFound.docButtonTitle': 'DOCS',
    'entityTabs.tabsAriaLabel': 'Pestañas',
    'deleteEntity.dialogTitle': '¿Seguro que quieres eliminar esta entidad?',
    'deleteEntity.deleteButtonTitle': 'Eliminar',
    'deleteEntity.cancelButtonTitle': 'Cancelar',
    'deleteEntity.description':
      'Esta entidad no es referenciada por ninguna ubicación y, por tanto, no recibe actualizaciones.',
    'deleteEntity.actionButtonTitle': 'Eliminar entidad',
    'entityProcessingErrorsDescription': 'El error de abajo se origina en',
    'entityRelationWarningDescription':
      'Esta entidad tiene relaciones con otras entidades que no se encuentran en el catálogo.\n Las entidades no encontradas son: ',
    'hasComponentsCard.title': 'Contiene componentes',
    'hasComponentsCard.emptyMessage':
      'Ningún componente forma parte de este sistema',
    'hasResourcesCard.title': 'Contiene recursos',
    'hasResourcesCard.emptyMessage':
      'Ningún recurso forma parte de este sistema',
    'hasSubcomponentsCard.title': 'Contiene subcomponentes',
    'hasSubcomponentsCard.emptyMessage':
      'Ningún subcomponente forma parte de este componente',
    'hasSubdomainsCard.title': 'Contiene subdominios',
    'hasSubdomainsCard.emptyMessage':
      'Ningún subdominio forma parte de este dominio',
    'hasSystemsCard.title': 'Contiene sistemas',
    'hasSystemsCard.emptyMessage': 'Ningún sistema forma parte de este dominio',
    'relatedEntitiesCard.emptyHelpLinkTitle': 'Aprende cómo cambiar esto',
    'systemDiagramCard.title': 'Diagrama del sistema',
    'systemDiagramCard.description':
      'Usa pellizcar y zoom para moverte por el diagrama.',
    'systemDiagramCard.edgeLabels.partOf': 'parte de',
    'systemDiagramCard.edgeLabels.provides': 'provee',
    'systemDiagramCard.edgeLabels.dependsOn': 'depende de',
  },
});

const catalogReactEs = createTranslationMessages({
  ref: catalogReactTranslationRef,
  messages: {
    'catalogFilter.title': 'Filtros',
    'catalogFilter.buttonTitle': 'Filtros',
    'entityKindPicker.title': 'Clase',
    'entityKindPicker.errorMessage':
      'No se pudieron cargar las clases de entidad',
    'entityLifecyclePicker.title': 'Lifecycle',
    'entityNamespacePicker.title': 'Namespace',
    'entityOwnerPicker.title': 'Propietario',
    'entityProcessingStatusPicker.title': 'Estado de procesado',
    'entityTagPicker.title': 'Etiquetas',
    'entityPeekAheadPopover.title':
      'Entra en la entidad para ver todas las etiquetas.',
    'entityPeekAheadPopover.emailCardAction.title': 'Email {{email}}',
    'entityPeekAheadPopover.emailCardAction.subTitle': 'mailto {{email}}',
    'entityPeekAheadPopover.emailCardAction.ariaLabel': 'Email',
    'entityPeekAheadPopover.entityCardActionsAriaLabel': 'Mostrar',
    'entityPeekAheadPopover.entityCardActionsTitle': 'Mostrar detalles',
    'entitySearchBar.placeholder': 'Buscar',
    'entityTypePicker.title': 'Tipo',
    'entityTypePicker.errorMessage': 'No se pudieron cargar los tipos de entidad',
    'entityTypePicker.optionAllTitle': 'todos',
    'favoriteEntity.addToFavorites': 'Añadir a favoritos',
    'favoriteEntity.removeFromFavorites': 'Quitar de favoritos',
    'inspectEntityDialog.title': 'Inspector de entidades',
    'inspectEntityDialog.closeButtonTitle': 'Cerrar',
    'inspectEntityDialog.ancestryPage.title': 'Ascendencia',
    'inspectEntityDialog.ancestryPage.description':
      'Esta es la ascendencia de entidades por encima de la actual: las cadenas de entidades hasta la actual, donde {{processorsLink}} entidades hijas que en último término llevaron a que la actual existiera. Nótese que es un mecanismo completamente diferente de las relaciones.',
    'inspectEntityDialog.ancestryPage.processorsLink': 'procesadores emitidos',
    'inspectEntityDialog.colocatedPage.title': 'Colocadas',
    'inspectEntityDialog.colocatedPage.description':
      'Estas son las entidades coubicadas con esta entidad: las que provienen de la misma fuente de datos (por ejemplo, del mismo fichero YAML) o del mismo origen (por ejemplo, de la URL originalmente registrada).',
    'inspectEntityDialog.colocatedPage.alertNoLocation':
      'La entidad no tenía información de ubicación.',
    'inspectEntityDialog.colocatedPage.alertNoEntity':
      'No había otras entidades en esta ubicación.',
    'inspectEntityDialog.colocatedPage.locationHeader': 'En la misma ubicación',
    'inspectEntityDialog.colocatedPage.originHeader': 'En el mismo origen',
    'inspectEntityDialog.jsonPage.title': 'Entidad como JSON',
    'inspectEntityDialog.jsonPage.description':
      'Estos son los datos crudos de la entidad recibidos del catálogo, en formato JSON.',
    'inspectEntityDialog.overviewPage.title': 'Resumen',
    'inspectEntityDialog.overviewPage.relation.title': 'Relaciones',
    'inspectEntityDialog.overviewPage.status.title': 'Estado',
    'inspectEntityDialog.overviewPage.identity.title': 'Identidad',
    'inspectEntityDialog.overviewPage.metadata.title': 'Metadatos',
    'inspectEntityDialog.overviewPage.annotations': 'Anotaciones',
    'inspectEntityDialog.overviewPage.labels': 'Etiquetas',
    'inspectEntityDialog.overviewPage.tags': 'Etiquetas',
    'inspectEntityDialog.yamlPage.title': 'Entidad como YAML',
    'inspectEntityDialog.yamlPage.description':
      'Estos son los datos crudos de la entidad recibidos del catálogo, en formato YAML.',
    'inspectEntityDialog.tabNames.overview': 'Resumen',
    'inspectEntityDialog.tabNames.ancestry': 'Ascendencia',
    'inspectEntityDialog.tabNames.colocated': 'Colocadas',
    'inspectEntityDialog.tabNames.json': 'JSON crudo',
    'inspectEntityDialog.tabNames.yaml': 'YAML crudo',
    'inspectEntityDialog.tabsAriaLabel': 'Opciones del inspector',
    'unregisterEntityDialog.title':
      '¿Seguro que quieres dar de baja esta entidad?',
    'unregisterEntityDialog.cancelButtonTitle': 'Cancelar',
    'unregisterEntityDialog.deleteButtonTitle': 'Eliminar entidad',
    'unregisterEntityDialog.deleteEntitySuccessMessage':
      'Entidad {{entityName}} eliminada',
    'unregisterEntityDialog.bootstrapState.title':
      'No puedes dar de baja esta entidad, ya que proviene de una configuración protegida de Backstage (ubicación "{{location}}"). Si crees que es un error, contacta con el integrador de {{appTitle}}.',
    'unregisterEntityDialog.bootstrapState.advancedDescription':
      'Tienes la opción de eliminar la entidad del catálogo. Ten en cuenta que esto solo debe hacerse si sabes que el fichero del catálogo ha sido eliminado o movido de su ubicación de origen. Si no, la entidad reaparecerá pronto cuando el catálogo haga la siguiente ronda de actualización.',
    'unregisterEntityDialog.bootstrapState.advancedOptions': 'Opciones avanzadas',
    'unregisterEntityDialog.onlyDeleteStateTitle':
      'Esta entidad no parece originarse en una ubicación registrada. Por tanto, solo tienes la opción de eliminarla directamente del catálogo.',
    'unregisterEntityDialog.unregisterState.title':
      'Esta acción dará de baja las siguientes entidades:',
    'unregisterEntityDialog.unregisterState.subTitle':
      'Ubicadas en la siguiente ubicación:',
    'unregisterEntityDialog.unregisterState.description':
      'Para deshacer, vuelve a registrar la entidad en {{appTitle}}.',
    'unregisterEntityDialog.unregisterState.unregisterButtonTitle':
      'Dar de baja la ubicación',
    'unregisterEntityDialog.unregisterState.advancedOptions': 'Opciones avanzadas',
    'unregisterEntityDialog.unregisterState.advancedDescription':
      'También tienes la opción de eliminar la entidad del catálogo. Esto solo debería hacerse si sabes que el fichero del catálogo ha sido eliminado o movido de su ubicación de origen. Si no, la entidad reaparecerá pronto en la siguiente ronda de actualización.',
    'unregisterEntityDialog.errorStateTitle': 'Error interno: estado desconocido',
    'userListPicker.defaultOrgName': 'Compañía',
    'userListPicker.personalFilter.title': 'Personal',
    'userListPicker.personalFilter.ownedLabel': 'En propiedad',
    'userListPicker.personalFilter.starredLabel': 'Favoritos',
    'userListPicker.orgFilterAllLabel': 'Todos',
    'entityTableColumnTitle.name': 'Nombre',
    'entityTableColumnTitle.system': 'Sistema',
    'entityTableColumnTitle.owner': 'Propietario',
    'entityTableColumnTitle.type': 'Tipo',
    'entityTableColumnTitle.lifecycle': 'Lifecycle',
    'entityTableColumnTitle.namespace': 'Namespace',
    'entityTableColumnTitle.description': 'Descripción',
    'entityTableColumnTitle.tags': 'Etiquetas',
    'entityTableColumnTitle.targets': 'Destinos',
    'entityTableColumnTitle.title': 'Título',
    'entityTableColumnTitle.label': 'Etiqueta',
    'entityTableColumnTitle.domain': 'Dominio',
    'missingAnnotationEmptyState.title': 'Falta una anotación',
    'missingAnnotationEmptyState.readMore': 'Leer más',
    'missingAnnotationEmptyState.annotationYaml':
      'Añade la anotación al YAML de tu {{entityKind}} como en el ejemplo destacado:',
    'missingAnnotationEmptyState.generateDescription_one':
      'Falta la anotación {{annotations}}. Necesitas añadirla a tu {{entityKind}} si quieres habilitar esta herramienta.',
    'missingAnnotationEmptyState.generateDescription_other':
      'Faltan las anotaciones {{annotations}}. Necesitas añadirlas a tu {{entityKind}} si quieres habilitar esta herramienta.',
  },
});

const coreComponentsEs = createTranslationMessages({
  ref: coreComponentsTranslationRef,
  messages: {
    'signIn.title': 'Iniciar sesión',
    'signIn.loginFailed': 'Error al iniciar sesión',
    'signIn.customProvider.title': 'Usuario personalizado',
    'signIn.customProvider.subtitle':
      'Introduce tu propio ID de usuario y credenciales.\n Esta selección no se almacenará.',
    'signIn.customProvider.userId': 'ID de usuario',
    'signIn.customProvider.tokenInvalid':
      'El token no es un JWT de OpenID Connect válido',
    'signIn.customProvider.continue': 'Continuar',
    'signIn.customProvider.idToken': 'ID Token (opcional)',
    'signIn.guestProvider.title': 'Invitado',
    'signIn.guestProvider.subtitle':
      'Entrar como usuario invitado.\n No tendrás una identidad verificada, por lo que algunas funcionalidades pueden no estar disponibles.',
    'signIn.guestProvider.enter': 'Entrar',
    'skipToContent': 'Saltar al contenido',
    'copyTextButton.tooltipText': 'Texto copiado al portapapeles',
    'simpleStepper.reset': 'Reiniciar',
    'simpleStepper.finish': 'Finalizar',
    'simpleStepper.next': 'Siguiente',
    'simpleStepper.skip': 'Saltar',
    'simpleStepper.back': 'Atrás',
    'errorPage.subtitle': 'ERROR {{status}}: {{statusMessage}}',
    'errorPage.title': '¡Parece que alguien soltó el micro!',
    'errorPage.goBack': 'Volver',
    'errorPage.showMoreDetails': 'Mostrar más detalles',
    'errorPage.showLessDetails': 'Mostrar menos detalles',
    'emptyState.missingAnnotation.title': 'Falta una anotación',
    'emptyState.missingAnnotation.actionTitle':
      'Añade la anotación al YAML de tu componente como en el ejemplo destacado:',
    'emptyState.missingAnnotation.readMore': 'Leer más',
    'supportConfig.default.title': 'Soporte no configurado',
    'supportConfig.default.linkTitle':
      'Añade la clave de configuración `app.support`',
    'errorBoundary.title':
      'Por favor, contacta con {{slackChannel}} para obtener ayuda.',
    'oauthRequestDialog.title': 'Se requiere iniciar sesión',
    'oauthRequestDialog.authRedirectTitle':
      'Esto desencadenará una redirección HTTP al login de OAuth.',
    'oauthRequestDialog.login': 'Iniciar sesión',
    'oauthRequestDialog.rejectAll': 'Rechazar todo',
    'oauthRequestDialog.message':
      'Inicia sesión para permitir a {{appTitle}} acceder a las APIs e identidades de {{provider}}.',
    'supportButton.title': 'Soporte',
    'supportButton.close': 'Cerrar',
    'table.filter.title': 'Filtros',
    'table.filter.clearAll': 'Limpiar todo',
    'table.filter.placeholder': 'Todos los resultados',
    'table.body.emptyDataSourceMessage': 'No hay registros para mostrar',
    'table.pagination.firstTooltip': 'Primera página',
    'table.pagination.labelDisplayedRows': '{from}-{to} de {count}',
    'table.pagination.labelRowsSelect': 'filas',
    'table.pagination.lastTooltip': 'Última página',
    'table.pagination.nextTooltip': 'Página siguiente',
    'table.pagination.previousTooltip': 'Página anterior',
    'table.toolbar.search': 'Filtrar',
    'table.header.actions': 'Acciones',
    'alertDisplay.message_one': '({{ count }} mensaje más reciente)',
    'alertDisplay.message_other': '({{ count }} mensajes más recientes)',
    'autoLogout.stillTherePrompt.title': 'Cerrando sesión por inactividad',
    'autoLogout.stillTherePrompt.buttonText':
      '¡Sí! No cierres mi sesión',
    'dependencyGraph.fullscreenTooltip': 'Alternar pantalla completa',
    'proxiedSignInPage.title':
      'No pareces haber iniciado sesión. Por favor, intenta recargar la página.',
    'logViewer.searchField.placeholder': 'Buscar',
  },
});

const userSettingsEs = createTranslationMessages({
  ref: userSettingsTranslationRef,
  messages: {
    'languageToggle.title': 'Idioma',
    'languageToggle.description': 'Cambiar el idioma',
    'languageToggle.select': 'Seleccionar idioma {{language}}',
    'themeToggle.title': 'Tema',
    'themeToggle.description': 'Cambiar el modo del tema',
    'themeToggle.select': 'Seleccionar {{theme}}',
    'themeToggle.selectAuto': 'Seleccionar tema automático',
    'themeToggle.names.light': 'Claro',
    'themeToggle.names.dark': 'Oscuro',
    'themeToggle.names.auto': 'Automático',
    'signOutMenu.title': 'Cerrar sesión',
    'signOutMenu.moreIconTitle': 'más',
    'pinToggle.title': 'Fijar barra lateral',
    'pinToggle.description': 'Evita que la barra lateral se contraiga',
    'pinToggle.switchTitles.unpin': 'Desfijar barra lateral',
    'pinToggle.switchTitles.pin': 'Fijar barra lateral',
    'pinToggle.ariaLabelTitle': 'Conmutador de fijar barra lateral',
    'identityCard.title': 'Identidad de Backstage',
    'identityCard.noIdentityTitle': 'Sin identidad de Backstage',
    'identityCard.userEntity': 'Entidad de usuario',
    'identityCard.ownershipEntities': 'Entidades en propiedad',
    'defaultProviderSettings.description':
      'Proporciona autenticación frente a las APIs e identidades de {{provider}}',
    'emptyProviders.title': 'Sin proveedores de autenticación',
    'emptyProviders.description':
      'Puedes añadir proveedores de autenticación a Backstage para usarlos al autenticarte.',
    'emptyProviders.action.title':
      'Abre app-config.yaml y realiza los cambios destacados:',
    'emptyProviders.action.readMoreButtonTitle': 'Leer más',
    'providerSettingsItem.title.signIn': 'Iniciar sesión en {{title}}',
    'providerSettingsItem.title.signOut': 'Cerrar sesión de {{title}}',
    'providerSettingsItem.buttonTitle.signIn': 'Iniciar sesión',
    'providerSettingsItem.buttonTitle.signOut': 'Cerrar sesión',
    'authProviders.title': 'Proveedores disponibles',
    'defaultSettingsPage.tabsTitle.general': 'General',
    'defaultSettingsPage.tabsTitle.authProviders':
      'Proveedores de autenticación',
    'defaultSettingsPage.tabsTitle.featureFlags':
      'Indicadores de funcionalidades',
    'featureFlags.title': 'Indicadores de funcionalidades',
    'featureFlags.description':
      'Recarga la página cuando cambies los indicadores de funcionalidades',
    'featureFlags.emptyFlags.title': 'Sin indicadores de funcionalidades',
    'featureFlags.emptyFlags.description':
      'Los indicadores de funcionalidades permiten que los plugins registren funcionalidades en Backstage a las que los usuarios pueden optar. Puedes usarlos para separar lógica en tu código, hacer pruebas A/B manuales, etc.',
    'featureFlags.emptyFlags.action.title':
      'Un ejemplo de cómo añadir un indicador de funcionalidad se muestra a continuación:',
    'featureFlags.emptyFlags.action.readMoreButtonTitle': 'Leer más',
    'featureFlags.filterTitle': 'Filtrar',
    'featureFlags.clearFilter': 'Limpiar filtro',
    'featureFlags.flagItem.title.disable': 'Desactivar',
    'featureFlags.flagItem.title.enable': 'Activar',
    'featureFlags.flagItem.subtitle.registeredInApplication':
      'Registrado en la aplicación',
    'featureFlags.flagItem.subtitle.registeredInPlugin':
      'Registrado en el plugin {{pluginId}}',
    'settingsLayout.title': 'Ajustes',
    'sidebarTitle': 'Ajustes',
    'profileCard.title': 'Perfil',
    'appearanceCard.title': 'Apariencia',
  },
});

const searchEs = createTranslationMessages({
  ref: searchTranslationRef,
  messages: {
    'searchModal.viewFullResults': 'Ver todos los resultados',
    'searchType.allResults': 'Todos los resultados',
    'searchType.tabs.allTitle': 'Todos',
    'searchType.accordion.allTitle': 'Todos',
    'searchType.accordion.collapse': 'Contraer',
    'searchType.accordion.numberOfResults': '{{number}} resultados',
    'sidebarSearchModal.title': 'Buscar',
  },
});

const notificationsEs = createTranslationMessages({
  ref: notificationsTranslationRef,
  messages: {
    'notificationsPage.title': 'Notificaciones',
    'notificationsPage.tableTitle.all_one':
      'Todas las notificaciones ({{count}})',
    'notificationsPage.tableTitle.all_other':
      'Todas las notificaciones ({{count}})',
    'notificationsPage.tableTitle.saved_one':
      'Notificaciones guardadas ({{count}})',
    'notificationsPage.tableTitle.saved_other':
      'Notificaciones guardadas ({{count}})',
    'notificationsPage.tableTitle.unread_one':
      'Notificaciones no leídas ({{count}})',
    'notificationsPage.tableTitle.unread_other':
      'Notificaciones no leídas ({{count}})',
    'notificationsPage.tableTitle.read_one':
      'Notificaciones leídas ({{count}})',
    'notificationsPage.tableTitle.read_other':
      'Notificaciones leídas ({{count}})',
    'filters.title': 'Filtros',
    'filters.view.label': 'Vista',
    'filters.view.unread': 'Notificaciones no leídas',
    'filters.view.read': 'Notificaciones leídas',
    'filters.view.saved': 'Guardadas',
    'filters.view.all': 'Todas',
    'filters.createdAfter.label': 'Enviadas',
    'filters.createdAfter.placeholder': 'Notificaciones desde',
    'filters.createdAfter.last24h': 'Últimas 24 h',
    'filters.createdAfter.lastWeek': 'Última semana',
    'filters.createdAfter.anyTime': 'En cualquier momento',
    'filters.sortBy.label': 'Ordenar por',
    'filters.sortBy.placeholder': 'Campo por el que ordenar',
    'filters.sortBy.newest': 'Más recientes primero',
    'filters.sortBy.oldest': 'Más antiguas primero',
    'filters.sortBy.topic': 'Tema',
    'filters.sortBy.origin': 'Origen',
    'filters.severity.label': 'Severidad mínima',
    'filters.severity.critical': 'Crítica',
    'filters.severity.high': 'Alta',
    'filters.severity.normal': 'Normal',
    'filters.severity.low': 'Baja',
    'filters.topic.label': 'Tema',
    'filters.topic.anyTopic': 'Cualquier tema',
    'table.emptyMessage': 'No hay registros para mostrar',
    'table.pagination.firstTooltip': 'Primera página',
    'table.pagination.labelDisplayedRows': '{from}-{to} de {count}',
    'table.pagination.labelRowsSelect': 'filas',
    'table.pagination.lastTooltip': 'Última página',
    'table.pagination.nextTooltip': 'Página siguiente',
    'table.pagination.previousTooltip': 'Página anterior',
    'table.bulkActions.markAllRead': 'Marcar todas como leídas',
    'table.bulkActions.markSelectedAsRead':
      'Marcar las seleccionadas como leídas',
    'table.bulkActions.returnSelectedAmongUnread':
      'Devolver las seleccionadas a no leídas',
    'table.bulkActions.saveSelectedForLater':
      'Guardar las seleccionadas para más tarde',
    'table.bulkActions.undoSaveForSelected':
      'Deshacer guardado de las seleccionadas',
    'table.confirmDialog.title': '¿Estás seguro?',
    'table.confirmDialog.markAllReadDescription':
      'Marcar <b>todas</b> las notificaciones como <b>leídas</b>.',
    'table.confirmDialog.markAllReadConfirmation': 'Marcar todas',
    'table.errors.markAllReadFailed':
      'No se pudieron marcar todas las notificaciones como leídas',
    'sidebar.title': 'Notificaciones',
    'sidebar.errors.markAsReadFailed':
      'No se pudo marcar la notificación como leída',
    'sidebar.errors.fetchNotificationFailed':
      'No se pudo obtener la notificación',
    'settings.title': 'Ajustes de notificaciones',
    'settings.errorTitle': 'No se pudieron cargar los ajustes',
    'settings.noSettingsAvailable':
      'No hay ajustes de notificaciones disponibles, vuelve más tarde',
    'settings.table.origin': 'Origen',
    'settings.table.topic': 'Tema',
    'settings.errors.useNotificationFormat':
      'useNotificationFormat debe usarse dentro de un NotificationFormatProvider',
  },
});

const orgEs = createTranslationMessages({
  ref: orgTranslationRef,
  messages: {
    'groupProfileCard.groupNotFound': 'Grupo no encontrado',
    'groupProfileCard.editIconButtonTitle': 'Editar metadatos',
    'groupProfileCard.refreshIconButtonTitle':
      'Programar actualización de la entidad',
    'groupProfileCard.refreshIconButtonAriaLabel': 'Actualizar',
    'groupProfileCard.listItemTitle.entityRef': 'Referencia de entidad',
    'groupProfileCard.listItemTitle.email': 'Email',
    'groupProfileCard.listItemTitle.parentGroup': 'Grupo padre',
    'groupProfileCard.listItemTitle.childGroups': 'Grupos hijos',
    'membersListCard.title': 'Miembros',
    'membersListCard.subtitle': 'de {{groupName}}',
    'membersListCard.paginationLabel': ', página {{page}} de {{nbPages}}',
    'membersListCard.noMembersDescription': 'Este grupo no tiene miembros.',
    'membersListCard.aggregateMembersToggle.directMembers': 'Miembros directos',
    'membersListCard.aggregateMembersToggle.aggregatedMembers':
      'Miembros agregados',
    'membersListCard.aggregateMembersToggle.ariaLabel':
      'Conmutador de tipo de usuarios',
    'ownershipCard.title': 'Propiedad',
    'ownershipCard.aggregateRelationsToggle.directRelations':
      'Relaciones directas',
    'ownershipCard.aggregateRelationsToggle.aggregatedRelations':
      'Relaciones agregadas',
    'ownershipCard.aggregateRelationsToggle.ariaLabel':
      'Conmutador de tipo de propiedad',
    'userProfileCard.userNotFound': 'Usuario no encontrado',
    'userProfileCard.editIconButtonTitle': 'Editar metadatos',
    'userProfileCard.listItemTitle.email': 'Email',
    'userProfileCard.listItemTitle.memberOf': 'Miembro de',
    'userProfileCard.moreGroupButtonTitle': '...Más ({{number}})',
    'userProfileCard.allGroupDialog.title': 'Todos los grupos de {{name}}:',
    'userProfileCard.allGroupDialog.closeButtonTitle': 'Cerrar',
  },
});

export const appTranslations = [
  catalogEs,
  catalogReactEs,
  coreComponentsEs,
  userSettingsEs,
  searchEs,
  notificationsEs,
  orgEs,
];
