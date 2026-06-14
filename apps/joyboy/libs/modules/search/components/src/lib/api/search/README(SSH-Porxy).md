## SwitchHosts

```sh
# test-us
127.0.0.1	vpc-crusader-test-use1-2-qtjyphpwvq7xbxa42bq6ggbpn4.us-east-1.es.amazonaws.com
# test-sg
127.0.0.1	vpc-new-crusader-test-apse1-bxwiazplp33frhjscccawme34m.ap-southeast-1.es.amazonaws.com
# test-au
127.0.0.1	vpc-crusader-test-apse2-3ptzrgycnlxajjawxqptlwjumq.ap-southeast-2.es.amazonaws.com
# test-ca
127.0.0.1	vpc-crusader-test-cca1-ukcq7uqqqjf753fwcybq3u7vq4.ca-central-1.es.amazonaws.com
# test-uk
127.0.0.1	vpc-crusader-test-euw2-l2uyyt2bytzqfgze6h3ojskwwi.eu-west-2.es.amazonaws.com
```

## Shell

```sh
# test-us
ssh -f rick_gao@jumphost-sg.castlery.com -L 127.0.0.1:9201:vpc-crusader-test-use1-2-qtjyphpwvq7xbxa42bq6ggbpn4.us-east-1.es.amazonaws.com:443 -N -o ServerAliveInterval=30
# test-sg
ssh -f rick_gao@jumphost-sg.castlery.com -L 127.0.0.1:9202:vpc-new-crusader-test-apse1-bxwiazplp33frhjscccawme34m.ap-southeast-1.es.amazonaws.com:443 -N -o ServerAliveInterval=30
# test-au
ssh -f rick_gao@jumphost-sg.castlery.com -L 127.0.0.1:9203:vpc-crusader-test-apse2-3ptzrgycnlxajjawxqptlwjumq.ap-southeast-2.es.amazonaws.com:443 -N -o ServerAliveInterval=30
# test-ca
ssh -f rick_gao@jumphost-sg.castlery.com -L 127.0.0.1:9204:vpc-crusader-test-cca1-ukcq7uqqqjf753fwcybq3u7vq4.ca-central-1.es.amazonaws.com:443 -N -o ServerAliveInterval=30
# test-uk
ssh -f rick_gao@jumphost-sg.castlery.com -L 127.0.0.1:9205:vpc-crusader-test-euw2-l2uyyt2bytzqfgze6h3ojskwwi.eu-west-2.es.amazonaws.com:443 -N -o ServerAliveInterval=30
```

```sh
curl -k -X POST "https://127.0.0.1:9201/web_product/_search" -u "admin:5772Bw\$E]6" -H "Content-Type: application/json" -d '{"query":{"match":{"name":"sofa"}},"size":3}' | cat
```
