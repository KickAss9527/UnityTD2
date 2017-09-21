using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class Bullet : MonoBehaviour {

	float fSpeed = 50.0f;
	public int iDmg = 0;
	bool flgFly = false;
	Transform target;
	// Use this for initialization
	void Start () {
//		Debug.Log ("create bullet");
	}
	
	// Update is called once per frame
	void Update () 
	{
		if (target == null) {
			Destroy (this.gameObject);
			return;
		}
	
		if (flgFly) 
		{
			transform.position = Vector3.MoveTowards (transform.position, target.position, fSpeed * Time.deltaTime);
//			transform.rotation = Quaternion.LookRotation (target.position - transform.position);
			transform.LookAt (target.position);
		}
	}

	public void fly(Transform _target)
	{
		this.target = _target;
		this.flgFly = true;
//		transform.rotation = Quaternion.LookRotation (vTraget - transform.position);
	}


}
