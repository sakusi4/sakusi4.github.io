---
layout: post
title: "OpenMUL, 이더넷 스위치(Switch) 구현"
category: sdn
date: 2020-12-05
---
허브에서 약간만 수정하면 스위치가 됩니다. 스위치의 각 포트에 대해서 첫 번째 Packet In 이벤트가 발생할 때, 출발지 맥주소와 들어온 포트 번호를 연결해두면 됩니다.

이후에 학습된 맥주소가 도착지로 설정된 패킷이 들어오면 연결해두었던 포트 번호로 내보내면 됩니다.

{% highlight c linenos=table %}
// openmul/application/hello/hello.c
// 26 ~ 46줄에 추가
GHashTable  *l2fdb_htbl;

static void
l2fdb_ent_free(void *arg)
{
    free(arg);
}

static unsigned int 
l2fdb_key(const void *p)
{   
    const uint8_t *mac_da = p;    
    return hash_bytes(mac_da, OFP_ETH_ALEN, 1);
}

static int
l2fdb_equal(const void *p1, const void *p2)
{
    return !memcmp(p1, p2, OFP_ETH_ALEN);
}

{% endhighlight %}

맥 주소와 포트 번호를 연결하는 방법은 여러 가지가 있겠죠. C언어에서는 크게 두 가지 겠네요. 구조체를 사용해서 묶거나 해시테이블을 사용하면 됩니다. 지금은 해시테이블이 올바른 선택입니다. 두 개의 자료가 일대일 매칭이라는 점과 빠른 검색 속도가 필요하기 때문이죠. 구조체를 사용하면 시간 복잡도가 O(N)이 됩니다. 반면 해시테이블은 O(1)입니다. 

위 세 개의 함수는 GLib의 해시테이블을 사용하기 위한 함수들로 각각 해싱 함수, 비교 함수, 메모리 해제 함수입니다.
굳이 GLib을 안 써도 해시테이블은 간단한 자료구조이므로 쉽게 구현할 수 있습니다.

{% highlight c linenos=table %}
// openmul/application/hello/hello.c
static void 
hello_sw_add(mul_switch_t *sw)
{    
    hello_install_dfl_flows(sw->dpid);
    c_log_debug("switch dpid 0x%llx joined network", (unsigned long long)(sw->dpid));

    // 스위치가 추가 되면 해시 테이블 생성
    l2fdb_htbl = g_hash_table_new_full(l2fdb_key, l2fdb_equal, NULL, l2fdb_ent_free);
}
{% endhighlight %}

sw_add 이벤트 처리 함수에 테이블 생성 부분을 추가합시다. 현재 테이블은 전역 변수로 하나만 존재하기 때문에 스위치가 하나인 토포롤지에서만 동작합니다.

{% highlight c linenos=table %}
// openmul/application/hello/hello.c
static void 
hello_packet_in(mul_switch_t *sw UNUSED, struct flow *fl UNUSED, uint32_t inport UNUSED,
                uint32_t buffer_id UNUSED, uint8_t *raw UNUSED, size_t pkt_len UNUSED)
{        
    struct of_pkt_out_params parms;
    struct mul_act_mdata mdata;  
    uint32_t oport = OFPP_FLOOD;
    uint32_t lrn_port;
    uint32_t in_port = htonl(fl->in_port);    

    lrn_port = g_hash_table_lookup(l2fdb_htbl, fl->dl_src);
    if(!lrn_port){
        printf("Host %d을 Port %d 에 연결\n", fl->dl_src[5], in_port);
        g_hash_table_insert(l2fdb_htbl, fl->dl_src, in_port);
    }

    lrn_port = g_hash_table_lookup(l2fdb_htbl, fl->dl_dst);
    if(lrn_port){
        printf("학습된 포트 사용 : Host %d ->  Host %d,  Output Port %d\n", fl->dl_src[5], fl->dl_dst[5], lrn_port);
        oport = lrn_port;
    }else{
        printf("학습된 적 없는 목적지 : Host %d\n", fl->dl_dst[5]);
    }
        
    mul_app_act_alloc(&mdata);
    mdata.only_acts = true;
    mul_app_act_set_ctors(&mdata, sw->dpid);
    mul_app_action_output(&mdata, oport);
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

중요한 packet_in 이벤트 처리 함수입니다. g_hash_table_lookup 함수는 테이블에 키가 존재하면 연결된 값을 반환하고 없으면 NULL을 반환합니다. 이것을 이용해서 쉽게 학습처리가 가능합니다.

{% highlight c linenos=table %}
~/openmul # sudo mn --topo single,3 --mac --switch ovsk --controller remote
~/openmul # ./mul.sh start custom 
~/openmul/application/hello # make
~/openmul/application/hello # sudo ./mulhello

mininet> h1 ping h2
{% endhighlight %}

결과를 확인해봅시다.

![0](/assets/images/2020-12-04-OpenMUL-2/0.png)

학습이 잘되네요. 학습 후에는 학습된 정보를 사용하는 것을 확인할 수 있습니다.


