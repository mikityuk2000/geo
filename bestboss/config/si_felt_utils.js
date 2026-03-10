/****************************************************************************/
/*  Утилииты ведуще-детализированного интерфейса.                           */
/*                                                                          */
/*  Copyright 2024 Silentium Company                                        */
/****************************************************************************/

  // --------------------------------------------------------------------------
  // Извлечь перечень полей шаблона в виде нумерованного массива 
  // $ATemplate - текаст шаблона, наопример "Привет, [NAME]"
  // --------------------------------------------------------------------------
  function SiExtractFieldsToArray(ATemplate) {
    var xArray = [];
    var xPosition = 0;
    var i = 0;

    do {
      xPosition  = ATemplate.indexOf("[", xPosition   );
      xEnd       = ATemplate.indexOf("]", xPosition + 1);
      xFieldName = ATemplate.substring( xPosition + 1, xEnd);

      // Если было найдено, то обрабатываем
      if ( xPosition !== -1) {
        // Проверяем, не было такого поля ранее
        if (
            ( xArray.includes(xFieldName) == false ) &&
            ( xFieldName !== 'undefined' ) &&
            ( xFieldName !== null ) &&
            ( xFieldName.length !== 0 ) 
           ) {
          // Заппоминаем в масив
          xArray[i] = xFieldName;
          i = i + 1;
          // alert('Here ' + xFieldName + " " + xPosition);
        }
        // Переходим в конец поиска
        xPosition = xEnd + 1;  
      }
    } while ( xPosition !== -1);
    // Вернуть массив
    return xArray;
  }

  // --------------------------------------------------------------------------
  // Перевести массив в строку например, SiArrayJoin(xRecord, ', ')
  //   $AArray     - массив
  //   $ADelimiter - разделитель
  // --------------------------------------------------------------------------
  function SiArrayJoin($AArray, $ADelimiter) {
    var xResult = '';
    for(var xName in $AArray) {
      xValue = $AArray[xName];
      if ( xResult !== '' ){
        xResult = xResult + $ADelimiter;
      }
      xResult = xResult + xName + ' = ' + xValue;
    }
    return xResult;
  }

  // --------------------------------------------------------------------------
  // Склеить параметры. Второй параметр затирает первый, если повторяетя
  //   AParamsFirst  - Первый параметр
  //   AParamsSecond - Второй параметр
  // --------------------------------------------------------------------------
  function SiMergeParams(AParamsFirst, AParamsSecond) {
    var xResult = AParamsFirst;
    for (var xKey in AParamsSecond) {
       xResult[xKey] = AParamsSecond[xKey]
    }
    return xResult;
  }
