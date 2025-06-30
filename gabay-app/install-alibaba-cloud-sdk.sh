#!/bin/bash
# Install Alibaba Cloud SDK dependencies for React Native

echo "Installing Alibaba Cloud SDK dependencies..."

# Install Core SDK
npm install @alicloud/pop-core

# Install NLP SDK
npm install @alicloud/nlp20180408

# Install NLS SDK - Note: using npm package for NLS client
npm install alibabacloud-nls

# Install React Native compatible libraries
npm install react-native-crypto
npm install react-native-randombytes
npm install @craftzdog/react-native-buffer

# Install additional utilities
npm install axios
npm install base-64
npm install crypto-js

echo "Alibaba Cloud SDK dependencies installed successfully!"
