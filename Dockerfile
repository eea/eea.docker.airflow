FROM apache/airflow:2.8.4

ADD ./requirements.txt /
ADD ./docker_start.sh /

USER root
RUN apt update && \
    apt install git -y && \
    apt install libmagic1 -y && \
    apt install gosu

USER airflow

RUN pip install -r /requirements.txt

USER root

ENTRYPOINT ["/usr/bin/dumb-init", "--", "/docker_start.sh"]
