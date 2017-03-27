# Interbank KYC

Библиотека и тестовое приложение для обмена KYC анкетами при межбанковском взаимодействии.

## Обоснование

Банки, вступающие в бизнес друг с другом, вступают в отношения клиент-поставщик. По закону, в таких отношениях
банк обязан удостовериться, что с клиентом можно иметь дело. Это так называемая политика Know Your Customer.
В России её определяет [115 федеральный закон](http://www.consultant.ru/document/cons_doc_LAW_32834/).
Банки обмениваются KYC-анкетами, которые содержат данные о контактных данных, капитале, управлении,
структуре собственности и мерах, предпринимаемых по борьбе с отмыванием денежных средств. 

### Проблема

KYC анкеты передаются в бумажном виде. Это медленно и трудоёмко. Отдельные сотрудники существуют
только для оформления этих бумаг.

### Решение

Логически обмен KYC-анкетами представляет собой рассылку документов подписчикам.
Обеспечим отношения издатель-подписчик через публикацию обновлений об изменении KYC анкет на блокчейне.
Подписчики, их число, собственно KYC анкета&nbsp;&mdash; структура взаимоотношений&nbsp;&mdash; являются
конфиденциальной информацией. Для сохранения в секрете структуры взаимоотношений используется
шифрование и обфускация этой информации.

![Обфускация](doc/banks_and_question.svg)

Для примера, банк А рассылает свою KYC-анкету банку Б. Банки обладают собственными ключами&nbsp;&mdash; приватным и публичным.
В соответствии с общей схемой [асимметричной криптографии](https://ru.wikipedia.org/wiki/Криптосистема_с_открытым_ключом)
обозначим ![m](doc/formulas/m.png) шифрование сообщения ![m](doc/formulas/m.png) публичным
ключом.

### Что дальше

KYC анкеты между банками представляют собой точку входа в открытые банковские API, в том числе для денежных переводов,
а также возможность участия в экосистеме финансовых услуг Мастерчейна небанковских провайдеров услуг.

## Установка

    $ cd interbank
    $ npm install
    $ npm link
    
или

    $ cd interbank
    $ npm install -g 
    
Потенциально возможно использование контейнера Докер и HTTP API. Dockerfile для этого включен в поставку. Например, корректной
можно считать следующую последовательность команд:

    $ cd interbank
    $ docker build .
    $ docker run -v /path/to/datadir:/datadir -e "KEY_FILE_PATH=/datadir/keystore/UTC--2016-12-18T09-50-49.590391588Z--0434984cd3959c18d7e17ee3fc35a2a6249ca828" \
      -e "ETH_NETWORK=mc" \
      -e "ETH_HOST=localhost" \
      -e "ETH_PORT=8545" \
      -e "SWARM_HOST=localhost" \
      -e "SWARM_PORT=8500" \
      IMAGE

Здесь `/path/to/datadir` указывает на папку с приватным ключом Эфириума, KEY_FILE_PATH указывает к нему путь внутри контейнера.
`IMAGE` - имя контейнера, полученное на шаге `docker build`. Значение остальных переменных окружения указано ниже.

### Сторонние компоненты

* **Ethereum:** Считаем, что на машине развёрнута эфириум-нода со стандартным HTTP RPC API `http://localhost:8545`.
* **Swarm:** Необходимо, чтобы на машине работал swarm со стандартным HTTP RPC API `http://localhost:8500/bzzr:`. Для установки Swarm следует пройти шаги, изложенные в [Swarm Guide](https://swarm-guide.readthedocs.io/en/latest/installation.html).
 
### Конфигурация

Переменные окружения устанавливают адреса HTTP RPC API к Ethereum и Swarm. Посла знака равно ниже указано значение по умолчанию.
 * `ETH_NETWORK=dev` - адрес контракта в сети, `mc` - сеть Мастерчейна,
 * `ETH_HOST=localhost` - хост Ethereum HTTP RPC API,
 * `ETH_PORT=8545` - порт Ethereum HTTP RPC API,
 * `SWARM_HOST=localhost` - хост Swarm HTTP RPC API,
 * `SWARM_PORT=8500` - порт Swarm HTTP RPC APi.
 
## Использование

### CLI

При глобальной установке (`npm install -g`) пакет `interbank` поставляет исполняемый файл `interbank`,
субкоманды которого описаны ниже.

Назначение системы - производить обмен сведениями в двухсторонних отношениях с контрагентами в стиле "издатель-подписчик".
Контрагент идентифицируется публичным ключом. Для обмена сведениями необходимо обменяться публичными ключами.
Стандартные средства Эфириума не позволяют легко оперировать публичными ключами, поэтому к использованию предлагаются следующие команды,
позволяющие обмениваться публичными ключами в формате [JWK](https://tools.ietf.org/html/rfc7517).

    $ interbank export <PATH TO ETHEREUM KEY> <PASSWORD> <PATH TO EXPORTED JWK> 
    
экспортирует публичный ключ из файла `<PATH TO ETHEREUM KEY>` с приватным ключом, защищённым паролем `<PASSWORD>`,
в JWK, расположенный в файле `<PATH TO EXPORTED JWK>`. Этот публичный ключ контрагент импортирует командой

    $ interbank import <PATH TO JWK>
    
Далее следует загрузить файл KYC анкеты в систему:

    $ interbank upload <PATH TO ETHEREUM KEY> <PASSWORD> <KYC>
    
Здесь `<KYC>` соответствует пути к файлу KYC анкеты. На данном этапе развития это может быть файл любого формата.
Предпочтительно PDF. В связи с несовершенством системы желательно использовать файлы размером менее 1 МиБ.
Команда `interbank upload` открывает файл KYC анкеты только для контрагентов, ключи которых были импортированы ранее.
Внешний наблюдатель не имеет доступа к KYC анкете.

Для выгрузка KYC анкеты контрагента с адресом `0xDEADBEAF` следует воспользоваться командой `interbank download`:

    $ interbank download <PATH TO ETHEREUM KEY> <PASSWORD> <PATH TO DOWNLOADED FILE> --address 0xDEADBEAF
    
Команда скачает файл KYC анкеты контрагента в файл `<PATH TO DOWNLOADED FILE>`.

Пароль `<PASSWORD>` необходим для получения приватного ключа в открытом виде, который используется для расшифровки
скачиваемой KYC анкеты.
