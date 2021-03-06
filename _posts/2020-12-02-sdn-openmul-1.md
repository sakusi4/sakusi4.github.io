---
layout: post
title: "OpenMUL, 이더넷 허브(Hub) 구현"
category: sdn
date: 2020-12-04
---
누워서 떡 먹기인 간단한 허브를 구현해보면서 OpenMUL의 분위기를 파악해봅시다.
OpenMUL에는 입문자를 위한 hello 예제가 준비 돼 있습니다. 이번 포스팅에선 코드 분석은 안하겠습니다.

일단 적당히 수정해서 허브를 만듭시다.

{% highlight c linenos=table %}
// openmul/application/hello/hello.c
struct mul_app_client_cb hello_app_cbs = {
    .switch_priv_alloc = NULL,
    .switch_priv_free = NULL,
    .switch_add_cb =  hello_sw_add,         /* Switch add notifier */
    .switch_del_cb = hello_sw_del,          /* Switch delete notifier */
    .switch_priv_port_alloc = NULL,
    .switch_priv_port_free = NULL,
    .switch_port_add_cb = NULL,
    .switch_port_del_cb = NULL,
    .switch_port_link_chg = NULL,
    .switch_port_adm_chg = NULL,
    .switch_packet_in = hello_packet_in,    /* Packet-in notifier */ 
    .core_conn_closed = hello_core_closed,  /* Core connection drop notifier */
    .core_conn_reconn = hello_core_reconn   /* Core connection join notifier */
};  

{% endhighlight %}

5가지의 이벤트가 등록돼있네요. 여기서 중요한 부분은 hello_packet_in 이벤트입니다. 나머지 부분은 일단 신경 쓰지 맙시다.

packet_in 이벤트를 처리하기 전에 함수 몇 개를 미리 정의합시다.

{% highlight c linenos=table %}
// openmul/application/hello/hello.c
static void
print_mac_address(const char *str, const uint8_t *addr)
{
    int i;
    
    printf("%s", str);
    printf("%d", addr[0]);    
    for(i=1; i<6; i++)
    {
        printf("-%d", addr[i]);
    }
}

static void 
print_packet_info(mul_switch_t *sw, struct flow *fl, uint32_t buffer_id, uint8_t *raw, size_t pkt_len)
{
    c_log_info("packet-in from network!");

    printf("dpid: 0x%llx , fl->in_port: %d\n", (unsigned long long)sw->dpid, htonl(fl->in_port));        
    printf("bufID: %d, raw: %d, len: %d\n", buffer_id, *raw, (int)pkt_len);    
    print_mac_address("eth_src: ", fl->dl_src); 
    printf(", ");
    print_mac_address("eth_dst: ", fl->dl_dst); 
    printf("\n");    
    printf("frame type: %d, vlan: %d, vlan_pcp: %d\n", fl->dl_type, fl->dl_vlan, fl->dl_vlan_pcp);
    
    printf("ip_src: %x, ip_dst: %x, ip_proto: %d\n", htonl(fl->ip.nw_src), htonl(fl->ip.nw_dst), fl->nw_proto);        
    printf("src port: %d, dst port: %d\n\n", fl->tp_src, fl->tp_dst);
}
{% endhighlight %}

hello_packet_in 함수에서 사용할 함수들입니다. 그러니 hello_packet_in 위에 추가합시다. 밑에 추가하면 위에 따로 선언를 해야 하니 귀찮습니다.

이제 hello_packet_in 함수를 수정해보죠.

{% highlight c linenos=table %}
// openmul/application/hello/hello.c
static void 
hello_packet_in(mul_switch_t *sw UNUSED, struct flow *fl UNUSED, uint32_t inport UNUSED,
                uint32_t buffer_id UNUSED, uint8_t *raw UNUSED, size_t pkt_len UNUSED)
{
    struct of_pkt_out_params parms;
    struct mul_act_mdata mdata;  

    print_packet_info(sw, fl, buffer_id, raw, pkt_len);

    mul_app_act_alloc(&mdata);

    mdata.only_acts = true;
    mul_app_act_set_ctors(&mdata, sw->dpid);
    mul_app_action_output(&mdata, OFPP_FLOOD);
    parms.buffer_id = buffer_id;
    parms.in_port = inport;
    parms.action_list = mdata.act_base;
    parms.action_len = mul_app_act_len(&mdata);
    parms.data_len = pkt_len;
    parms.data = raw;

    mul_app_send_pkt_out(NULL, sw->dpid, &parms);
    mul_app_act_free(&mdata);

    return;
}
{% endhighlight %}

패킷이 들어오면 묻지도 따지지도 않고 Flooding을 시켜버립시다. 

코드를 다 수정했으면 make를 입력해서 빌드하고 실행합시다.

{% highlight c linenos=table %}
~/openmul # sudo mn --topo single,3 --mac --switch ovsk --controller remote

~/openmul/application/hello # make
~/openmul/application/hello # sudo ./mulhello

mininet>h1 ping h2
{% endhighlight %}

결과를 확인해볼까요.

![0](/assets/images/2020-12-04-OpenMUL-1/0.png)

ping이 문제 없이 수행됩니다.

![1](/assets/images/2020-12-04-OpenMUL-1/1.png)

컨트롤러 측에선 입력 패킷에 대한 정보를 알려주네요. 그래 봐야 우리의 허브는 멍청해서 정보를 학습하지 않습니다.

잘 되셨나요? 안된다고요? 네 정상입니다. 사실 빼먹은 게 있습니다. SDN 애플리케이션은 독립적으로 동작하지 못합니다. 그러므로
미리 실행되고 있어야 하는 프로그램들이 존재합니다. openmul/mul.sh 파일을 수정해서 간단하게 처리 가능합니다.

{% highlight bash linenos=table %}
// openmul/mul.sh
// 92 ~ 108줄에 추가
    echo "OpenMUL l2switch mode is running.."
    ;;
"custom")
    pushd  $curr_dir/mul/ >> /dev/null
    sudo ./mul -d
    popd >> /dev/null
    pushd  $curr_dir/application/cli/ >> /dev/null
    sudo ./mulcli -V 10000  -d
    popd >> /dev/null
    source pythonpath.sh
    pushd  $curr_dir/application/nbapi/py-tornado/ >> /dev/null
    sudo PYTHONPATH=$PYTHONPATH ./mulnbapi start > /dev/null 2>&1
    popd >> /dev/null
    echo "Custom Mode: mul, cli, pythonpath is running"
    ;;
"fabric")
    pushd  $curr_dir/mul/ >> /dev/null    

{% endhighlight %}

원래 파일에는 custom 부분이 존재하지 않습니다. 94~106부분에 custom을 추가해서 위와 같은 모양으로 만드세요.

자 이제 저장하고 정말로 실행해봅시다. 

{% highlight c linenos=table %}
~/openmul # ./mul.sh start custom // 최초 1회만 실행해두고 까먹으면 됩니다.
* ./mul.sh stop // 끄고 싶을 땐 stop 합시다.

~/openmul/application/hello # sudo ./mulhello

~/openmul # sudo mn --topo single,3 --mac --switch ovsk --controller remote
mininet> h1 ping h2
{% endhighlight %}

이제 위에서 봤던 이미지와 같은 결과를 볼 수 있습니다. 으음.. 그래도 안된다고요? 안타깝네요. 

다음 포스팅에서 좀 더 자세하게 코드를 분석해보겠습니다.