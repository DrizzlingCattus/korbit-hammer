## 데이터 파일 저장 및 불러오기(io.js)
1.` 데이터를 파일에 저장할 수 있다.`
1-1. 파일에 저장할 때 원하는 포멧으로 지정해서 저장할 수 있다.
"apple pie" => "start:: apple pie\n"
1-2. 파일을 쓸 때, 오류가 나면 reject시킨다.
1-3. 큰 크기의 데이터를 파일에 쓸 수 있다.

2.` 파일의 데이터를 읽어올 수 있다.`
2-1. 파일을 "data"이벤트를 통해 읽을때, data를 완전히 소모하지 못해 end 이벤트가 발생안될 경우를 처리할 수 있다.

3.` 파일에 데이터를 append 시킬 수 있다.`

4. 파일을 stream을 통해 읽을 수 있다.(stream객체를 넘겨서)

5. 파일을 stream을 통해 쓸 수 있다.(stream객체를 넘겨서)


## 압축(compress.js)

- balloon.constant를 걷어내기 혹은 이용방안 고안...(추가기능요구)
compress test에서 해당 변수를 사용해서 함부로 지우지 못하는 상황.

### 압축하기 및 풀기
1.` 기본: 인메모리 형태로 압축시키기.`

2. callback 함수 체크
typeof callback === "function"

3. 발전: 아웃메모리 형태로 지원하기.

4.` 비동기 방식으로 데이터 수집하는 딜레이를 늦추면 안됨.`

5. 압축옵션을 deflate에 줄 수 있다.

### outputApi
1.` outputApi에 toAppendFile을 io.js module을 통해 refactoring하기.`

2.` path와 파일이름을 구분할 수 있다`~[deprecate]

3.` 파일 저장 및 불러오기에 대한 독립된 모듈을 구축한다.`

4.` 파일이름만 입력할 경우 프로세스 시작 디렉토리에 저장한다.`

5. 단일 파일에 데이터를 저장할 때, 적법한 오류 처리를 했는가?

6. outputApi에 option을 생략해서 적을 수 있다.
outputApi.toFile(path, [option], callback)

7.` outputApi에 특정한 문자를 붙여서 다시 outputApi를 호출할 수 있다.
ouputApi.appendLF().toFile();`

## 데이터 전송


## 메인 로직(index.js)
1. response에 대해서 일어나는 오류를 적법하게 처리할 수 있다.

2. 각 오류 발생시 stacktrace와 오류 원인을 저장할 Logger를 부착한다.

3. `response데이터를 임시파일에 저장 후, 나중에 한번에 압축시켜 압축효율을 높인다.`~[same with 6]

4. 시장이 임시로 닫혀서 요청에 대한 응답을 못받을시, 해당 오류를 적법히 처리한다.

5. 코드를 업데이트했을때, 이전에 돌아가는 프로세스와 바톤터치해서 새로운 프로세스를 생성할 수 있다.
(이렇게해서 수집하는 로그데이터를 최대한 늘린다.)

6. `하루동안 모은 데이터를 한번에 압축시켜 압축 효율을 올린다.`

7. status code가 200일때만(정상적인 금융데이터가 들어올때만) data를 write한다.

8. 데이터를 요청할때, 너무 많은 요청을 보내면 시간을 조절하여 로그 수집을 원활히 한다.
http 429 Too Many Request

9. status code 403 bad gateway에 대해서 적법한로그와 stacktrace를 출력한다.

10. `여러 종류의 가상화폐의 정보를 요청할 수 있다.`
