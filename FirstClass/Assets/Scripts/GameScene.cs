using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.UI;
using UnityEngine.EventSystems;
using DG.Tweening;
using UnityEngine.AI;

public class GameScene : MonoBehaviour 
{
	static GameScene instance = null;

	public static GameScene getInstance(){
		return instance;
	}

	public GameObject objEnemyPath;
	public GameObject UIBuilding;
	public GameObject preTowerA;
	public GameObject preTowerSlower;
	public GameObject preEnemyA;
	private Tile objCurSelectedTile = null;

	void Start()
	{
		instance = this;
		this.UIBuilding.SetActive (false);
		loadEnemy ();
	}
		
	void Update () {
		if (Input.GetMouseButtonUp(0) || (Input.touchCount > 0 && Input.GetTouch (0).phase == TouchPhase.Ended)) 
		{
			Ray ray = Camera.main.ScreenPointToRay (Input.mousePosition);
			RaycastHit hitInfo;
			if (Physics.Raycast (ray, out hitInfo, 99999, LayerMask.GetMask ("Tile"))) 
			{
				Tile t = hitInfo.collider.gameObject.GetComponent<Tile> ();
				if (t == objCurSelectedTile)
					return;

				if (objCurSelectedTile != null)
					this.objCurSelectedTile.evtUnselect ();

				t.evtSelect ();
				this.objCurSelectedTile = t;

				if (objCurSelectedTile.objTower == null) 
				{
					this.UIBuilding.SetActive (true);
				}
				else this.UIBuilding.SetActive (false);
			} 
			else 
			{
				if (objCurSelectedTile)
					objCurSelectedTile.evtUnselect();
				this.UIBuilding.SetActive (false);
				this.objCurSelectedTile = null;
			}
		}
	}

	Tower initTower(GameObject preObj, Vector3 pos)
	{
		GameObject gobj = GameObject.Instantiate(preObj, pos, new Quaternion());
		return gobj.GetComponent<Tower> ();
	}

	void evtBuildTower(GameObject preObj)
	{
		Vector3 tilePos = objCurSelectedTile.transform.position;
		Tower tower = initTower (preObj, tilePos);
		tower.transform.SetParent (GameObject.Find ("Towers").transform);

		this.objCurSelectedTile.objTower = tower;
		this.objCurSelectedTile.evtUnselect ();
		this.objCurSelectedTile = null;
		this.UIBuilding.SetActive (false);
	}

	public void evtBuildTowerAClick()
	{
		evtBuildTower (preTowerA);
	}

	public void evtBuildTowerSlowerClick()
	{
		evtBuildTower (preTowerSlower);
	}
		
	void loadEnemy()
	{
		Vector3 start = getPathPos(0);
		Enemy en = GameObject.Instantiate (preEnemyA, start, Quaternion.identity).GetComponent<Enemy>();
		en.transform.SetParent (GameObject.Find("Enemys").transform);

//		Sequence seq = DOTween.Sequence ();
//		Vector3 cur = new Vector3();
//		Vector3 next = new Vector3();
//		for (int i = 1; i < objEnemyPath.transform.childCount; i++) {
//			cur = objEnemyPath.transform.GetChild (i).transform.position;
//			if (i < objEnemyPath.transform.childCount - 1)
//				next = objEnemyPath.transform.GetChild (i+1).transform.position;
//			seq.Append (en.transform.DOMove (cur, Vector3.Distance (cur, start) / en.fSpeed));
//			seq.Join (en.transform.DOLookAt(cur, 0.15f));
//
//			start = cur;
//		}
//		en.objPathSeq = seq;
	}

	public int getPathPointCnt(){return objEnemyPath.transform.childCount;}
	public Vector3 getPathPos(int idx){
		return objEnemyPath.transform.GetChild (idx).transform.position;
	}
}
