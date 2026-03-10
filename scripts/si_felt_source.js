/****************************************************************************/
/*  Источник и навигация.                                                   */
/*                                                                          */
/*  Copyright 2024 Silentium Company                                        */
/****************************************************************************/
function TSiFeltSource() {

    var instance        = this;

    // Название
    this.Name           = '';
    // Источник
    this.SourceName     = '';
    // Номер по-порядку
    this.Index          = 0;
    // Элемент сборки источнков
    this.Felt           = null; 

    // Параметры
    this.SourceParams   = {};

    // Параметры для редактирования
    this.EditParams     = {};

    // Масссив данных 
    this.DataArray      = [];   

    // Первичный ключ
    this.KeyName        = '';  
    // Текущий код
    this.Current_Code   = 0;
    this.Current_Index  = 0;
    // Шаблоны 
    this.PlaceFrame;              // Место вставки. Куда размещать блоки 
    this.PlaceTemplate;           // Место размещения шаблона. Где брать шаблон
    this.PlaceBlock;              // Иеднтификаторов блока
    this.PlaceTemplateAdd;        // Идентификатор для добавлния в конце блоков

    // Цвета выделения записи
    this.BlockColor         = 'white';
    this.BlockColorSelected = '#E5E5E5'; // '#E5E5E5';

    // Меню. Идентификаторы
    this.html_id_menu_box;
    this.html_id_menu_button;    
    // Меню. Класс показывает, что можно закрыть
    this.html_class_menu_button_back = 'group_tune_button_back';

    // Перечень подстановок
    var MacroArray     = [];
    // Источники редактирования
    var EditSourceName = '';
    // Диалог
    var Dialog          = null;
    var DialogOperation = null;
    // Массивы первичных ключей
    var CheckArray     = [];
    var Current_Block  = null;

    /**************************************************/
    /* Загрузка данных. Оставить текущую запись       */
    /**************************************************/
    this.LoadData = function (AContinueIndex=false) {
      //
      var xParams = instance.Felt.CollectSourceParams(instance.Name); 
      // Собрать параметры вместе
      xParams = SiMergeParams(xParams, instance.SourceParams);
      // Очистить данные
      instance.ClearData(AContinueIndex);   
      instance.initDialog();
      // Загрузка данных
      instance.Felt.GetData(instance.SourceName, xParams, instance.ShowData);                                                                        
    }

    /**************************************************/
    /* Очистить источник                             */
    /**************************************************/
    this.ClearData = function (AContinueIndex) {
      // Текущая запись
      if ( AContinueIndex == false){
        instance.Current_Code  = 0;
        instance.Current_Index = 0;
      }
      // Обнулить массивы
      instance.DataArray = [];   
      CheckArray         = [];
      Current_Block      = null;
    }

    /**************************************************/
    /* Показать данные                                */
    /**************************************************/
    this.ShowData = function (AData) {
      var i, j;
      var x_template, x_template_add; 
      var xKeyFieldName, xCode;
      var x_block      = '';
      var xHtml        = '';
      var xHtml_old    = '';

      instance.DataArray = AData;
      // Ключевое поле
      xKeyFieldName = instance.KeyName;
      // Считывааем шаблон
      x_template = $('#' + instance.PlaceTemplate).html();
      // Считывааем дополнительный шаблон
      x_template_add = $('#' + instance.PlaceTemplateAdd).html();
      // Перечень полей
      MacroArray = SiExtractFieldsToArray(x_template);

      for (var i = 0; i < instance.DataArray.length; i++) {
        // Записать коды, загруженных строк
        xRecord = instance.DataArray[i]; 
        xCode   = xRecord[xKeyFieldName];
        // Первый код
        if ( i == 0 ){
          if ( instance.Current_Code == 0 ){
            instance.Current_Code  = xCode;
          }
        }
        // Если эта запись текущая
        if ( instance.Current_Code == xCode ) {
          instance.Current_Index = i;
        }
        // Сохранить в массив ключей
        CheckArray[i] = xCode;
        //
        x_block = x_template;
        // Макроподстановки по всем полям
        for (var j = 0; j < MacroArray.length; j++) {
          xFieldName = MacroArray[j];
          xValue = xRecord[xFieldName];
          if( xValue != undefined ) {
            x_block = SiReplaceMacroAll(xFieldName,  xValue, x_block, true);
          } 
        }
        xHtml = xHtml + x_block;
      }
      // Вставляем шаблон на место
      xHtml = xHtml + x_template_add;
      $('#' + instance.PlaceFrame).html(xHtml);    

      // Если нет записей, то проставить пустые значения
      if (instance.DataArray.length == 0) {
         instance.ShowDataBySource('empty');
      }

      // Показать текущий после загрузки блока
      xElement = document.getElementById(instance.PlaceBlock + instance.Current_Code);
      if ( xElement !== null ) {
        xElement.addEventListener('load', instance.SelectBlock(instance.Current_Code, true) ); 
      } else {
        // Если не надо отбражать, то выводим сразу же
        instance.SelectBlock(instance.Current_Code, true);
      }

    }

    /**************************************************/
    /* Выбрать текущий блок                           */
    /**************************************************/
    this.SelectBlock = function (ACode, AForceRefresh=false) {
        var xLastCode = instance.Current_Code;

        // alert('Выбор блока: ' + instance.PlaceBlock + ' ' + xLastCode + ' ' +  ACode + ' AForceRefresh: ' + AForceRefresh);

        // Снимаем отметку с предыдущего текущего блока
        if ( Current_Block !== null){
          Current_Block.css('backgroundColor', instance.BlockColor);
        }
        // Адрес текщего блока БП
        Current_Block = $('#' + instance.PlaceBlock + ACode);   

        // Сделать его серым
        Current_Block.css('backgroundColor', instance.BlockColorSelected);    
        // Другой текущий код
        instance.RefreshCode(ACode);  
        // Показать подчиненные источники
        if ( 
             ( xLastCode !== ACode   ) ||
             ( AForceRefresh == true )
           ) {
           //
           xSource = instance.Felt.NextSourceByName(instance.Name);

           // if ( xSource !== undefined ) {
           if ( xSource !== null ) {
              xSource.LoadData();
              // alert(xSource.Name);
           }

        }
        // Показать в других местах
        instance.ShowDataBySource();   
    }

    /**************************************************/
    /* Обновить текщий индекс записи по коду          */
    /**************************************************/
    this.RefreshCode = function (ACode) {
      //
      if ( instance.Current_Code == ACode) {
        return false;
      }
      // Запомнить присланный код
      instance.Current_Code = ACode; 
      for (var i = 0; i < CheckArray.length; i++) {
        if ( CheckArray[i] == instance.Current_Code ) {
          instance.Current_Index = i;
        }
      }
      return true;
    }

    /**************************************************/
    /* Показать даные в произвольных местах           */
    /**************************************************/
    this.ShowDataBySource = function (AMode='current') { 

      var xElements, xFieldName, xValue, i;
      var x_field_template = '';
      var xMacroArray = []; 
      var x_trace = '';

      // Найти элементы с таким источником
      xElements = document.querySelectorAll('[data-source="' + instance.Name + '"]');
      // Текщая запись
      xRecord = instance.DataArray[instance.Current_Index]; 

      // Перебрать все элементы с источником
      for (var i = 0; i < xElements.length; i++) {
        xFieldName = xElements[i].getAttribute('data-field');
        x_field_template = xElements[i].getAttribute('data-template');

        if ( xFieldName !== null) {
          // Простой вариант, когда одно поле прописывается
          if ( AMode == 'current') {
            xValue  = xRecord[xFieldName];
            x_trace = x_trace + 'по полю ' + xFieldName + ' = ' + xValue + ' ';
            xElements[i].innerHTML = xValue;     
          }
          // Пустые значения
          if ( AMode == 'empty') {
            xElements[i].innerHTML = '';                         
          }
        }

        if ( x_field_template !== null) {
          xMacroArray = SiExtractFieldsToArray(x_field_template);
          for (var j = 0; j < xMacroArray.length; j++) {
            xFieldName = xMacroArray[j];
            xValue  = xRecord[xFieldName];
            if( xValue != undefined ) {
              x_field_template = SiReplaceMacroAll(xFieldName,  xValue, x_field_template, true);
            } 
          }
          if ( AMode == 'current') {
            xElements[i].innerHTML = x_field_template;  
          }
          // Пустые значения
          if ( AMode == 'empty') {
            xElements[i].innerHTML = '';                         
          }
          // x_trace = x_trace + 'по шаблону ' + xFieldName + ' = ' + xValue + ' ';
        }
      }

      // alert(instance.Name + ': ' + x_trace);
      // x_trace = '';

    }

    /**************************************************/
    /* Получить текущую запись данных                 */
    /**************************************************/
    this.getCurrrentRecord = function () {
      xRecord = instance.DataArray[instance.Current_Index]; 
      return xRecord;
    }

    /**************************************************/
    /* Подготовить диалог редактирования              */
    /**************************************************/
    this.initDialog = function (AGofunction) {
      if (Dialog === null) {
        Dialog = new TSiDBEditor('part-dialog0');
        Dialog.setBaseAddress(instance.BaseAddress);
        Dialog.setSourceName(instance.EditSourceName);
        Dialog.setOnAfterApply(function () {
          if ( DialogOperation == 'delete' ){
            // Поставить текущей предыдущую запись
            if ( instance.Current_Index > 0 ) {
              instance.Current_Index = instance.Current_Index - 1;
              instance.Current_Code  = CheckArray[instance.Current_Index];
            }
          }
          DialogOperation = null;
          instance.LoadData(true);
        });
      }
    }

    /**************************************************/
    /* Добавить запись                                */
    /**************************************************/
    this.AddRecord = function () {
      var xParams = instance.EditParams;

      // Проставить параметры
      xParams = instance.Felt.UpdateBindingParams(instance.Name, instance.EditParams);

      for(var xName in xParams) {
        xValue = xParams[xName];
        Dialog.setDefaultFieldValue(xName, xValue);
        // alert(xName + ' = ' + xValue);
      }
      DialogOperation = 'insert';
      Dialog.insertRecord();
    }

    /**************************************************/
    /* Редактировать запись                           */
    /**************************************************/
    this.EditRecord = function (ACode) {
      var keyValues = {};
      keyValues[instance.KeyName] = ACode;     
      Dialog.setKeyValues(keyValues);
      // alert('Редактирование ' + ACode);
      // alert('Редактирование ' + instance.EditSourceName + ' ' + instance.KeyName + ' ' + instance.BaseAddress);
      DialogOperation = 'edit';
      Dialog.updateRecord();
    }

    /**************************************************/
    /* Удалить запись                                 */
    /**************************************************/
    this.DeleteRecord = function (ACode) {
      // alert('Удалить ' + ACode);
      var keyValues = {};
      keyValues[instance.KeyName] = ACode;     
      Dialog.setKeyValues(keyValues);
      DialogOperation = 'delete';
      Dialog.deleteRecord();
    }


    /**************************************************/
    /* Показать меню                                  */
    /**************************************************/
    this.ShowMenu = function (ACode) {
      x_elenent = '#' + instance.html_id_menu_box + ACode;
      x_tune    = '#' + instance.html_id_menu_button + ACode;
      x_attr = $(x_elenent).css('visibility');
      // Если не видно, то показываем
      if ( x_attr == 'visible'){
        $(x_elenent).css('visibility', 'hidden');
        $(x_tune).removeClass(instance.html_class_menu_button_back); 
      } else {
        $(x_elenent).css('visibility', 'visible');
        $(x_tune).addClass(instance.html_class_menu_button_back); 
      }
      // Остальные всплывающие меню все спрятать
      instance.Felt.HideAllMenu(instance.Name, ACode);    
    }

    /*********************************************************/
    /* Спрятать меню кроме того, что с кодом AExceptCode     */
    /*********************************************************/
    this.HideMenu = function (AExceptCode) {     
      // Если есть меню, которое не прячем
      if ( AExceptCode == null){
        AExceptCode = 0;
      }
      // Перебрать коды, можкт меню висит
      for(var i=0; i < CheckArray.length; i++) {
        xCode = CheckArray[i];
        if ( xCode != AExceptCode){
          x_elenent = '#' + instance.html_id_menu_box + xCode;
          $(x_elenent).css('visibility', 'hidden');
          x_tune    = '#' + instance.html_id_menu_button + xCode;    
          $(x_tune).removeClass(instance.html_class_menu_button_back);         
        }
      }
    }


}
