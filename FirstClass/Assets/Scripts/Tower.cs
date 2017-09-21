using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using DG.Tweening;

public class Tower : MonoBehaviour {
	float fFireCoolDown = 0f;
	protected float fFireRate = 0.4f;
	int iDmg = 1;
	public int iAtkRadius = 30;
	public GameObject prefBullet;
	public GameObject objFirePos;
	public GameObject preCircle;
	GameObject objCircle;
	protected List<Enemy> listEnemys = new List<Enemy>();

	// Use this for initialization
	protected void init()
	{
		this.GetComponent<SphereCollider> ().radius = iAtkRadius;

		this.objCircle = GameObject.Instantiate (preCircle, new Vector3 (0,0,0), new Quaternion(), transform);
		objCircle.GetComponent<Circle> ().setupScale (iAtkRadius / 5f);
		this.objCircle.transform.localPosition = new Vector3 (0, 0, 0);
		this.objCircle.SetActive (false);
	}
	void Start () {
		this.init ();

	}

	bool canShoot(){return fFireCoolDown <= 0f;}
	void updateCoolDown(){
		if (fFireRate > 0) {
			this.fFireCoolDown -= Time.deltaTime;
		}
	} 

	void Update () 
	{
		updateCoolDown ();
		if (listEnemys.Count > 0) 
		{
			Enemy en = listEnemys [0];
			transform.Find("Body").DOLookAt (en.transform.position, 0.05f);
			if (canShoot ())
			{
//				attack (en.transform);
			}
		}

	}

	protected virtual void attack(Transform enemyTrans)
	{
		Bullet obj = GameObject.Instantiate (prefBullet, transform.parent).GetComponent<Bullet> ();
		obj.iDmg = this.iDmg;
		Vector3 pos = this.gameObject.transform.position;
		obj.transform.position = objFirePos.transform.position;
		obj.transform.LookAt (enemyTrans.position);
		obj.fly (enemyTrans);
		this.fFireCoolDown = this.fFireRate;
	}

	public void evtSelect()
	{
		if (objCircle) this.objCircle.SetActive (true);

	}
	public void evtUnSelect()
	{
		if (objCircle) this.objCircle.SetActive (false);
	}

	protected virtual void OnTriggerEnter(Collider col){
		Debug.Log ("enter");
		this.listEnemys.Add (col.gameObject.GetComponent<Enemy> ());
	}
	protected virtual void OnTriggerExit(Collider col)
	{
		Debug.Log ("exit");
		this.listEnemys.Remove (col.gameObject.GetComponent<Enemy> ());
	}
}
