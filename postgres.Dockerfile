FROM pgvector/pgvector:pg17

RUN apt update
RUN apt install -y wget gcc g++ make unzip postgresql-server-dev-17

RUN wget https://bitbucket.org/eunjeon/mecab-ko/downloads/mecab-0.996-ko-0.9.2.tar.gz
RUN wget https://bitbucket.org/eunjeon/mecab-ko-dic/downloads/mecab-ko-dic-2.1.1-20180720.tar.gz

RUN tar -xzf mecab-0.996-ko-0.9.2.tar.gz
RUN tar -xzf mecab-ko-dic-2.1.1-20180720.tar.gz

RUN cd mecab-0.996-ko-0.9.2 && ./configure --with-charset=utf8 && make && make install && ldconfig
RUN cd mecab-ko-dic-2.1.1-20180720 && ./configure && make && make install

RUN wget https://github.com/i0seph/textsearch_ko/archive/refs/heads/master.zip
RUN unzip master.zip

RUN cd textsearch_ko-master && export PATH=/opt/mecab-ko/bin:/postgres/17/bin:$PATH && make USE_PGXS=1 install