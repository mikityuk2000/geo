/****************************************************************************/
/*  Поддержка ведущего интерфейса                                           */
/*                                                                          */
/*  Copyright 2024 Silentium Company                                        */
/****************************************************************************/
function TSiFrontFelt() {

    var instance       = this;
    // Анимация. 
    this.WaitAnimation = null;
    // Все источники
    this.SourcesArray  = [];
    // Массив связей
    var BindingArray   = [];

    /**************************************************/
    /* Добавление истчника                            */
    /**************************************************/
    this.AddFeltSource = function (AName, ASource) {
      var xFeltSource = null;
      var xCout = instance.SourcesArray.length;
      xFeltSource = SiCreateObject(TSiFeltSource, TDataPort);
      instance.SourcesArray[xCout] = xFeltSource;
      // Проставить основные свойства
      xFeltSource.Name        = AName;
      xFeltSource.SourceName  = ASource;
      xFeltSource.Index       = xCout;
      xFeltSource.BaseAddress = instance.BaseAddress;
      xFeltSource.Felt        = instance;
      // Вернуть адрес объекта
      return xFeltSource;
    }

    /**************************************************/
    /* Загрузка данных                                */
    /**************************************************/
    this.LoadData = function (AName) {
      var xFeltSource = instance.FindSourceByName(AName);
      xFeltSource.LoadData();
    }

    /**************************************************/
    /* Выбрать блок                                   */
    /**************************************************/
    this.SelectBlock = function (AName, ACode, AForceRefresh) {
      xFeltSource = instance.FindSourceByName(AName);
      xFeltSource.SelectBlock(ACode, AForceRefresh)
    }

    /**************************************************/
    /* Источник по имени.                             */
    /**************************************************/
    this.FindSourceByName = function (AName) {

      var xResult = null;
      for (var i = 0; i < instance.SourcesArray.length; i++) {
        xName = instance.SourcesArray[i].Name;
        if ( xName == AName ){
          xResult = instance.SourcesArray[i];
        }
      }     

      return xResult;
    }

    /**************************************************/
    /* Следующий источник по имени.                   */
    /**************************************************/
    this.NextSourceByName = function (AName) {

      var xName, xNextName = '';
      var xResult = null;
      var xIndex = -1;

      for (var i = 0; i < instance.SourcesArray.length; i++) {
        xName = instance.SourcesArray[i].Name;
        // alert(' SourcesArray ' + xName);
        if ( xName == AName ){         
          xIndex = i + 1;
        }
      }  
   
      if ( xIndex < instance.SourcesArray.length ) {
          xResult = instance.SourcesArray[xIndex];
          xNextName = xResult.Name;
          // alert(AName + ' ' +' Next ' + xNextName + ' ' + ( xIndex ) );
      }

      // alert(xName);
      // alert(AName + xResult);

      return xResult;
    }


    /**************************************************/
    /* Загрузить связь источников                     */
    /**************************************************/
    this.AddBinding = function (AParams) {
      var xArray = [];
      var xParams = AParams;
      var xCount = BindingArray.length;
      for(var xName in xParams) {
        xValue = xParams[xName];
        xArray[xName] = xValue;
      }
      BindingArray[xCount] = xArray; 
    }

    /**************************************************/
    /* Собрать параметры со значением для источника   */
    /**************************************************/
    this.CollectSourceParams = function (ASourceToName) {

      var xParams = {};
      var xSourceFromName;
      var xCount = BindingArray.length;

      // Пройтись по связям и проставить параметры
      for (var i = 0; i < BindingArray.length; i++) {
        xArray = BindingArray[i];
        //
        if ( xArray['SourceTo'] == ASourceToName ){
           // Какие поля брать
           xFieldNameFrom = xArray['FieldFrom'];
           xFieldNameTo   = xArray['FieldTo'];   
           // Значение по-умолчанию
           xDefaultValue = xArray['Default'];
           // Из какого источник
           xSourceFromName = xArray['SourceFrom'];
           xSourceFrom = instance.FindSourceByName(xSourceFromName);
           // Если такой источник найден
           if ( xSourceFrom !== null ) {
             xRecord = xSourceFrom.getCurrrentRecord();
             if ( xRecord !== undefined ) {
               xValue  = xRecord[xFieldNameFrom];
             } else {
               xValue  = xDefaultValue;
             } 
             xParams[xFieldNameTo] = xValue;             
           } else {
             xParams[xFieldNameTo] = xDefaultValue;
           }
           // Соханить для трассировки
           xArray['Value'] = xParams[xFieldNameTo];
        }
      }
      // xString = JSON.stringify(xParams);
      // alert(xString);

      return xParams;
    }

    /**************************************************/
    /* Вывести отчет по настройкам.                   */
    /**************************************************/
    this.MakeReport = function (ASourceToName) {
      var xReport;

      xReport = '<h1>' + 'Отчет по настройкам' + '</h1>';

      xReport = xReport + '<h2>' + 'Источники' + '</h2>';
      xReport = xReport + instance.ReportSources();

      xReport = xReport + '<h2>' + 'Связи' + '</h2>';
      xReport = xReport + instance.ReportBinding();

      // Вывод на другой странице
      xWindow = window.open();
      xWindow.document.write(xReport);
      xWindow.document.close();

    }

    /**************************************************/
    /* Вывести отчет по источникам.                   */
    /**************************************************/
    this.ReportSources = function () {
      //
      xTable = '<table border=1>'
      //
      xTable = xTable + '<tr>';
      xTable = xTable + '<th>'+ 'Название'      + '</th>';
      xTable = xTable + '<th>'+ 'Источнк'       + '</th>';
      xTable = xTable + '<th>'+ 'Ключ'          + '</th>';
      xTable = xTable + '<th>'+ 'Source Params' + '</th>';
      xTable = xTable + '<th>'+ 'Edit Params'   + '</th>';
      xTable = xTable + '<th>'+ 'Count'         + '</th>';
      xTable = xTable + '</tr>';
      //
      for (var i = 0; i < instance.SourcesArray.length; i++) {
        xSources = instance.SourcesArray[i];
        xTable = xTable + '<tr>';
        xTable = xTable + '<td>' + xSources.Name                         + '</td>';
        xTable = xTable + '<td>' + xSources.SourceName                   + '</td>';
        xTable = xTable + '<td>' + xSources.KeyName                      + '</td>';
        xTable = xTable + '<td>' + JSON.stringify(xSources.SourceParams) + '</td>';
        xTable = xTable + '<td>' + JSON.stringify(xSources.EditParams)   + '</td>';                                          
        xTable = xTable + '<td>' + xSources.DataArray.length             + '</td>';
        xTable = xTable + '</tr>';
      }  
      xTable = xTable + '</table>'
      //
      return xTable;
    }

    /**************************************************/
    /* Вывести отчет по связям.                       */
    /**************************************************/
    this.ReportBinding = function () {

      //
      xTable = '<table border=1>'
      //
      xTable = xTable + '<tr>';
      xTable = xTable + '<th>'+ 'SourceFrom' + '</th>';
      xTable = xTable + '<th>'+ 'SourceTo'   + '</th>';
      xTable = xTable + '<th>'+ 'FieldFrom'  + '</th>';
      xTable = xTable + '<th>'+ 'FieldTo'    + '</th>';
      xTable = xTable + '<th>'+ 'Default'    + '</th>';
      xTable = xTable + '<th>'+ 'Value'      + '</th>';
      xTable = xTable + '</tr>';
      //
      for (var i = 0; i < BindingArray.length; i++) {
        xBinding = BindingArray[i];
        xTable = xTable + '<tr>';
        xTable = xTable + '<td>' + xBinding.SourceFrom + '</td>';
        xTable = xTable + '<td>' + xBinding.SourceTo   + '</td>';
        xTable = xTable + '<td>' + xBinding.FieldFrom  + '</td>';
        xTable = xTable + '<td>' + xBinding.FieldTo    + '</td>';
        xTable = xTable + '<td align="right">' + xBinding.Default    + '</td>';
        xTable = xTable + '<td align="right">' + xBinding.Value      + '</td>';
        xTable = xTable + '</tr>';
      }  
      xTable = xTable + '</table>'
      //
      return xTable; 
    }

    /**************************************************/
    /* Добавить запись                                */
    /**************************************************/
    this.AddRecord = function (AName, ACode) {
      xFeltSource = instance.FindSourceByName(AName);
      xFeltSource.AddRecord(ACode)
    }

    /**************************************************/
    /* Редактировать запись                           */
    /**************************************************/
    this.EditRecord = function (AName, ACode) {
      xFeltSource = instance.FindSourceByName(AName);
      xFeltSource.EditRecord(ACode)

    }
    /**************************************************/
    /* Удалить запись                                 */
    /**************************************************/
    this.DeleteRecord = function (AName, ACode) {
      // alert('Удалить ' + AName);    
      xFeltSource = instance.FindSourceByName(AName);
      xFeltSource.DeleteRecord(ACode)
    }

    /**************************************************/
    /* Показать меню                                  */
    /**************************************************/
    this.ShowMenu = function (AName, ACode) {
      xFeltSource = instance.FindSourceByName(AName);
      xFeltSource.ShowMenu(ACode)
    }

    /**************************************************/
    /* Спрятать все меню                              */
    /**************************************************/
    this.HideAllMenu = function (AName, ACode) {

      var xSource;

      for (var i = 0; i < instance.SourcesArray.length; i++) {
        xName = instance.SourcesArray[i].Name;
        xSource = instance.SourcesArray[i];
        if ( xName == AName ){
          // Прятать для всех кодов, кроме ACode 
          xSource.HideMenu(ACode);
          // alert('Код не прятать' + ACode);
        } else {
          // alert('Прятать для всех кодов' + AName);
          // Прятать для всех кодов
          xSource.HideMenu();
        }
      }     

    }

    /**************************************************/
    /* Обновить параметры AParams из связей.          */
    /**************************************************/
    this.UpdateBindingParams = function (ASourceTo, AParams) {
      var xParams = AParams;
      for (var xKey in xParams) {       
        // Смотрим, что есть в связях
        for (var j = 0; j < BindingArray.length; j++) {
          xRecord = BindingArray[j];
          if (
               ( xRecord['SourceTo'] == ASourceTo )  &&
               ( xRecord['FieldTo']  == xKey      )  
             ){
            xParams[xKey] = xRecord['Value'];
            // alert( xKey + ': ' + xRecord['FieldTo'] + ' -> ' + xRecord['Value'] );
            // Здесь так же надо пропиать для случая, когда занчение не просталено
            // тогда оно берется из xRecord['Default']. Пока что не на чем проверить.
          }
        }
      }
      return xParams;
    }


}