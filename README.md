# 레몬트리

![메인 이미지](https://i.imgur.com/QTOWv11.png)

일기를 쓰고, LLM을 통해 메모리를 생성하여 기록하고 분석해보세요!

- 일기 쓰기
- 일기 메모리화 - 일기의 중요한 사건들을 기억하고 참조해줘요!
- 일기/메모리 검색 - 의미론적 검색으로 편하게 검색할 수 있어요!
- 유저 관리 기능

## 설치 가이드

#### 현재 저장소를 복사해주세요.

```bash
git clone https://github.com/Bananamilk452/lemontree
```

#### .example.env를 .env로 복사한 후, 내용을 채워주세요.

```
// .example.env

POSTGRES_PASSWORD="mysecretpassword"
DATABASE_URL="postgresql://postgres:mysecretpassword@lemontree-postgres-1:5432/lemontree?schema=public"
GOOGLE_APPLICATION_CREDENTIALS="credentials.json"
BETTER_AUTH_SECRET="wow_such_secret_very_secure"
BETTER_AUTH_URL="http://localhost:3000"
BASE_URL="http://localhost:3000"
```

- `POSTGRES_PASSWORD`: 데이터베이스의 비밀번호입니다. 꼭 바꿔주세요!
- `DATABASE_URL`: 데이터베이스 연결 URL입니다. 바꾼 비밀번호를 여기에서도 수정해주셔야 합니다.
- `GOOGLE_APPLICATION_CREDENTIALS`: Google Cloud API 사용을 위한 키 파일의 이름입니다. **수정하면 안됩니다!**
- `BETTER_AUTH_SECRET`: better-auth의 암호화를 위한 해시입니다. 긴 무작위 문자열로 바꿔주세요.
- `BETTER_AUTH_URL`, `BASE_URL`: 배포하려는 주소입니다.

#### Google Cloud에서 API 키를 만듭니다.

1. [Google Cloud Console](https://console.cloud.google.com)로 접속합니다.
2. 필요한 경우 프로젝트를 생성합니다.
3. 좌측 메뉴에서 **API 및 서비스**를 클릭하고, **+ API 및 서비스 사용 설정**을 클릭합니다..
4. 검색 창에 `Vertex AI`라고 입력하고, 검색 결과에서 **Vertex AI API**를 선택합니다.
5. API를 사용 설정합니다.
6. 다시 좌측 메뉴에서 **API 및 서비스** > **사용자 인증 정보**로 들어갑니다.
7. **+ 사용자 인증 정보 만들기**에서 **서비스 계정**을 클릭합니다.
8. 서비스 계정의 이름은 원하는 값으로 채우고 **만들고 계속하기**를 클릭합니다.
9. 역할 선택에서 **Vertex AI 관리자**를 검색하고 선택합니다. **계속**을 누르고, **완료**를 누릅니다.
10. 생성된 서비스 계정을 클릭합니다.
11. 상단 탭에서 **키**를 클릭하고, **키 추가**, **새 키 만들기**, **JSON**으로 두고 **만들기**를 클릭합니다.
12. 해당 파일을 현재 폴더에 `credentials.json`라는 이름으로 넣습니다.

#### 원하는대로 compose.yml을 수정합니다.

기존 네트워크에 추가해야 하거나, ports를 통해 전체 개방이 필요하거나 할 경우엔 compose.yml을 수정합니다.

#### 빌드 후 실행합니다.

```
sudo docker compose build && sudo docker compose up -d
```

#### 관리자 계정을 생성합니다.

app 컨테이너 안으로 들어갑니다.

```
sudo docker exec -it lemontree-app-1 sh
```

관리자 계정을 생성하는 스크립트를 실행합니다. 값은 원하는 값으로 채웁니다.

```
pnpm run adduser --email example@example.com --name "유저 이름" --password "mysecretpassword" --admin
```

#### 끝! 배포한 URL로 들어가서 로그인 하면 됩니다!
