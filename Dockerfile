FROM apache/airflow:2.0.2

ADD ./requirements.txt /

USER root
RUN apt update && \
    apt install nodejs -y && \
    apt install npm -y && \
    apt install git -y && \
    apt install libmagic1 -y && \
    mkdir /esbootstrap && \
    chmod 777 /esbootstrap
USER airflow

RUN pip install -r /requirements.txt

RUN cd /esbootstrap && \
    git clone https://github.com/eea/eea.docker.esbootstrap.git && \
    git clone https://github.com/eea/eea.esbootstrap.configs.git && \
    cd /esbootstrap/eea.docker.esbootstrap/app && \
    npm install && \
    npm install undesrcore && \
    cd /esbootstrap/eea.esbootstrap.configs && \
    git checkout searchlib && \
    git pull && \
    rm -R /esbootstrap/eea.docker.esbootstrap/app/config && \
    ln -s /esbootstrap/eea.esbootstrap.configs /esbootstrap/eea.docker.esbootstrap/app/config
USER root
RUN    ln -s /esbootstrap/eea.docker.esbootstrap/app /code
USER airflow

ADD ./docker_start.sh /

USER root

ENTRYPOINT ["/usr/bin/dumb-init", "--", "/docker_start.sh"]
