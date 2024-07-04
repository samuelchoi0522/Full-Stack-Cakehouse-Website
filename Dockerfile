# Use a Node.js 18 base image
FROM node:18.20.3

# Set the working directory
WORKDIR /root/sweetplus

# Install dependencies and build tools
RUN apt-get clean && \
    apt-get update && \
    apt-get install -y --no-install-recommends \
        jq \
        bzip2 \
        rsync \
        gcc g++ make \
        vim wget curl \
        net-tools \
        libssl-dev \
        libffi-dev \
        zip \
        git \
        dos2unix \
        ca-certificates \
        openssh-client \
        python3 \
        python3-pip \
        python3-venv \
        build-essential \
        python3-dev \
        libyaml-dev \
        libpq-dev && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/*

# Create a virtual environment and activate it
RUN python3 -m venv /opt/venv

# Upgrade pip to the latest version
RUN /opt/venv/bin/pip install --upgrade pip

# Install AWS CLI and Elastic Beanstalk CLI in the virtual environment
RUN touch requirements.txt
RUN /opt/venv/bin/pip install PyYAML==5.3.1
RUN /opt/venv/bin/pip install awscli==1.27.160 botocore==1.29.160 s3transfer==0.6.1
RUN /opt/venv/bin/pip install --upgrade awsebcli

# AWS Credentials
COPY ./Dot_AWS_Credentials /root/.aws/credentials
COPY ./Dot_AWS_Config /root/.aws/config

# Ensure the virtual environment's binaries are in PATH
ENV PATH="/opt/venv/bin:$PATH"

# Install npm and other global packages
RUN npm install -g npm@10.7.0
RUN npm install -g nodemon@3.1.3

# Expose necessary ports
EXPOSE 3000
EXPOSE 3001

# Default command
CMD ["/bin/bash"]

